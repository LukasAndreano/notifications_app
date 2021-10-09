import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import bridge from "@vkontakte/vk-bridge";
import {
  SplitLayout,
  SplitCol,
  Cell,
  PanelHeader,
  Panel,
  Tabbar,
  TabbarItem,
  Epic,
  Group,
  withAdaptivity,
  Snackbar,
  Avatar,
  Badge,
  Alert,
  View,
  usePlatform,
  Footer,
  VKCOM,
} from "@vkontakte/vkui";

import { motion } from "framer-motion";

import {
  Icon28UserCircleOutline,
  Icon28NewsfeedOutline,
  Icon28RssFeedOutline,
  Icon16Cancel,
  Icon16Done,
  Icon28FireOutline,
  Icon28ServicesOutline,
} from "@vkontakte/icons";

import { useHistory } from "react-router-dom";

import {
  savePlatform,
  saveURL,
  setActiveModal,
  setUser,
  setPopout,
  setSnackbar,
  setNavigation,
  saveModalData,
  saveTag,
  updateNotifications,
  setDontClone,
  updateSwitchers,
} from "./reducers/mainReducer";
import api from "./service/improvedFetch";

import Controller from "./Controller";
import Modals from "./modals/main";

// VK STORAGE KEYS
const STORAGE_KEYS = {
  STATUS: "status",
  ONBOARDING: "onboarding",
};

const App = withAdaptivity(
  ({ viewWidth }) => {
    const platform = usePlatform();
    const isDesktop = viewWidth >= 3;
    const hasHeader = platform !== VKCOM;

    const [popout, setPopoutFunc] = useState(false);
    const [snackbar, setSnackbarFunc] = useState(null);
    const [ignore, setIgnore] = useState(false);

    const storage = useSelector((state) => state.main);
    const dispatch = useDispatch();

    // Инициализируем модальные окна
    const modal = Modals();

    // Получаем историю из роутера, необходимо для пуша в неё (URLChanger function)
    const history = useHistory();

    useEffect(() => {
      bridge.send("VKWebAppGetUserInfo").then((data) => {
        dispatch(setUser(data));
      });
    }, [dispatch]);

    useEffect(() => {
      bridge.subscribe(({ detail: { type} }) => {
        setIgnore(true);
        switch (type) {
          case "VKWebAppAllowNotificationsResult":
            if (!ignore) {
              api("enableNotificationsFromApp").then((data) => {
                if (data.response) {
                  dispatch(updateNotifications({ notifications: 1 }));
                  dispatch(updateSwitchers(true));
                  setTimeout(() => {
                    dispatch(updateSwitchers(false));
                  }, 100);
                }
              });
            }
            break;

          case "VKWebAppDenyNotificationsResult":
            if (!ignore) {
              api("disableNotificationsFromApp").then((data) => {
                if (data.response) {
                  dispatch(updateNotifications({ notifications: 0 }));
                  dispatch(updateSwitchers(true));
                  setTimeout(() => {
                    dispatch(updateSwitchers(false));
                  }, 100);
                }
              });
            }
            break;

          default:
            //
            break;
        }
      });
    }, [dispatch, storage.group_notifications, ignore]);

    useEffect(() => {
      bridge
        .send("VKWebAppStorageGet", {
          keys: Object.values(STORAGE_KEYS),
        })
        .then((data) => {
          if (data.keys[0].value !== "true") {
            setTimeout(() => {
              if (
                window.location.hash === null ||
                window.location.hash === ""
              ) {
                setTimeout(() => {
                  dispatch(setActiveModal("tour1"));
                }, 500);
                bridge.send("VKWebAppStorageSet", {
                  key: STORAGE_KEYS.STATUS,
                  value: "true",
                });
              } else {
                bridge.send("VKWebAppStorageSet", {
                  key: STORAGE_KEYS.STATUS,
                  value: "true",
                });
              }
            }, 1000);
          }
        });
    }, [dispatch]);

    useEffect(() => {
      if ((storage.popout.title && storage.popout.text) !== null) {
        history.push(window.location.pathname + "#popout");
        setPopoutFunc(
          <Alert
            onClose={() => {
              history.goBack();
            }}
            actions={[
              {
                title: "Понятно",
                autoclose: true,
                mode: "cancel",
              },
            ]}
            header={storage.popout.title}
            text={storage.popout.text}
          />
        );
      }
    }, [storage.popout, dispatch, history]);

    useEffect(() => {
      if (storage.snackbar.text !== null)
        setSnackbarFunc(
          <Snackbar
            layout="vertical"
            duration={4000}
            className={isDesktop ? "snackBar-fix" : ""}
            onClose={() => {
              dispatch(setSnackbar({ text: null }));
              setSnackbarFunc(null);
            }}
            before={
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <Avatar size={24} style={{ background: "var(--accent)" }}>
                  {storage.snackbar.success ? (
                    <Icon16Done fill="#fff" width={14} height={14} />
                  ) : (
                    <Icon16Cancel fill="#fff" width={14} height={14} />
                  )}
                </Avatar>
              </motion.div>
            }
          >
            {storage.snackbar.text}
          </Snackbar>
        );
    }, [
      setSnackbarFunc,
      dispatch,
      isDesktop,
      storage.snackbar.success,
      storage.snackbar.text,
    ]);

    // Ловим 1ю часть URL и сейвим в storage
    const locationListener = useCallback(() => {
      let url = window.location.pathname.split("/");
      if (url[2] !== undefined) {
        dispatch(setNavigation(false));
      } else {
        dispatch(setNavigation(true));
      }
      dispatch(saveURL(url[1]));

      if (url[1] === "services" && storage.tour === 1)
        setTimeout(() => dispatch(setActiveModal("tour2")), 500);
      else if (url[1] === "" && storage.tour === 4)
        setTimeout(() => dispatch(setActiveModal("tour5")), 500);
      else if (url[1] === "rating" && storage.tour === 5)
        setTimeout(() => dispatch(setActiveModal("tour6")), 500);
      else if (url[1] === "profile" && storage.tour === 6)
        setTimeout(() => dispatch(setActiveModal("tour7")), 500);
    }, [dispatch, storage.tour]);

    // При клике на ссылку в эпике пушим в историю эту страницу
    function URLChanger(e) {
      if (
        storage.url === "index.html" &&
        e.currentTarget.dataset.story === ""
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (
          e.currentTarget.dataset.story !== storage.url &&
          storage.navigation
        ) {
          history.push("/" + e.currentTarget.dataset.story);
          locationListener();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }

    useEffect(() => {
      let url = window.location.pathname.split("/");
      dispatch(saveURL(url[1]));
    }, [dispatch, history]);

    useEffect(() => {
      if (storage.updateURL) locationListener();
    }, [storage.updateURL, locationListener]);

    useEffect(() => {
      if (window.location.hash !== null && window.location.hash !== "") {
        api(
          "getContentMakerServices",
          "tag=" + window.location.hash.substr(1)
        ).then((data) => {
          if (data.response !== "not_found" && data.response.length !== 0) {
            dispatch(saveTag(window.location.hash.substr(1)));
            history.push("/subscriptions");
            dispatch(saveModalData({ contentMakerServices: data.response }));
            setTimeout(() => {
              dispatch(setActiveModal("contentMakerServices"));
            }, 500);
          }
        });
      }
    }, [dispatch, history]);

    window.onpopstate = () => {
      if ((storage.popout.title && storage.popout.text) !== null) {
        dispatch(
          setPopout({
            title: null,
            text: null,
          })
        );
        setPopoutFunc(null);
      } else if (storage.activeModal !== null) {
        dispatch(setActiveModal(null));
      } else if (
        window.location.hash.substr(1) !== "" && window.location.hash.substr(1) !== "popout" &&
        window.location.hash.substr(1) !== storage.tag
      ) {
        dispatch(setDontClone(true));
        setTimeout(
          () => dispatch(setActiveModal(window.location.hash.substr(1))),
          50
        );
      }

      locationListener();
    };

    useEffect(() => {
      // Определяем платформу пользователя (desktop или нет)
      console.log("[Log] Platform detected! isDesktop: " + isDesktop);
      dispatch(savePlatform(isDesktop));

      window.addEventListener("offline", () => {
        setPopoutFunc(null);
        dispatch(setActiveModal(null));
        dispatch(
          setSnackbar({
            success: false,
            text: "Вы потеряли подключение к сети. Загрузка контента, обновление ленты, а также отправка некоторых данных может быть недоступна.",
          })
        );
      });

      window.addEventListener("online", () => {
        dispatch(
          setSnackbar({
            text: "Подключение к сети восстановлено.",
            success: true,
          })
        );
        history.push("/online");
        history.goBack();
      });
    }, [dispatch, isDesktop, history]);

    return (
      <Fragment>
        <SplitLayout
          header={hasHeader && <PanelHeader separator={false} />}
          style={{ justifyContent: "center" }}
        >
          {isDesktop && (
            <SplitCol fixed width="280px" maxWidth="280px">
              <Panel nav="navigationDesktop">
                {hasHeader && <PanelHeader />}
                <Group>
                  <Cell
                    className={!storage.navigation && "disabledNav"}
                    style={
                      storage.url === "profile"
                        ? {
                            backgroundColor:
                              "var(--button_secondary_background)",
                            borderRadius: 8,
                          }
                        : {}
                    }
                    data-story="profile"
                    onClick={URLChanger}
                    disabled={storage.url === "profile" || !storage.navigation}
                    before={<Icon28UserCircleOutline />}
                    indicator={storage.tour === 6 && <Badge mode="prominent" />}
                  >
                    Профиль
                  </Cell>
                  <Cell
                    className={!storage.navigation && "disabledNav"}
                    style={
                      storage.url === "" || storage.url === "index.html"
                        ? {
                            backgroundColor:
                              "var(--button_secondary_background)",
                            borderRadius: 8,
                          }
                        : {}
                    }
                    data-story=""
                    onClick={URLChanger}
                    disabled={
                      storage.url === "" ||
                      storage.url === "index.html" ||
                      !storage.navigation
                    }
                    before={<Icon28NewsfeedOutline />}
                    indicator={storage.tour === 4 && <Badge mode="prominent" />}
                  >
                    Лента уведомлений
                  </Cell>
                  <Cell
                    style={
                      storage.url === "subscriptions"
                        ? {
                            backgroundColor:
                              "var(--button_secondary_background)",
                            borderRadius: 8,
                          }
                        : {}
                    }
                    data-story="subscriptions"
                    onClick={URLChanger}
                    disabled={
                      storage.url === "subscriptions" || !storage.navigation
                    }
                    before={<Icon28RssFeedOutline />}
                    indicator={
                      (storage.tour === 3 || storage.tour === 2) && (
                        <Badge mode="prominent" />
                      )
                    }
                  >
                    Ваши подписки
                  </Cell>
                  <Cell
                    className={!storage.navigation && "disabledNav"}
                    style={
                      storage.url === "services"
                        ? {
                            backgroundColor:
                              "var(--button_secondary_background)",
                            borderRadius: 8,
                          }
                        : {}
                    }
                    data-story="services"
                    onClick={URLChanger}
                    indicator={storage.tour === 1 && <Badge mode="prominent" />}
                    disabled={storage.url === "services" || !storage.navigation}
                    before={<Icon28ServicesOutline />}
                  >
                    Доступные сервисы
                  </Cell>
                  <Cell
                    className={!storage.navigation && "disabledNav"}
                    style={
                      storage.url === "rating"
                        ? {
                            backgroundColor:
                              "var(--button_secondary_background)",
                            borderRadius: 8,
                          }
                        : {}
                    }
                    data-story="rating"
                    onClick={URLChanger}
                    disabled={storage.url === "rating" || !storage.navigation}
                    before={<Icon28FireOutline />}
                    indicator={storage.tour === 5 && <Badge mode="prominent" />}
                  >
                    Популярные
                  </Cell>
                </Group>
                <Footer style={{ marginTop: -10 }}>
                  Версия приложения: 1.1.2 <br />
                  Разработчик:{" "}
                  <a
                    href="https://vk.com/id172118960"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Никита Балин
                  </a>
                </Footer>
              </Panel>
            </SplitCol>
          )}

          <SplitCol
            animate={!isDesktop}
            spaced={isDesktop}
            width={isDesktop ? "560px" : "100%"}
            maxWidth={isDesktop ? "560px" : "100%"}
          >
            <Epic
              activeStory={"default"}
              tabbar={
                !isDesktop && (
                  <Tabbar>
                    <TabbarItem
                      onClick={URLChanger}
                      disabled={
                        !storage.navigation ||
                        storage.url === "" ||
                        storage.url === "index.html"
                      }
                      selected={
                        storage.url === "" || storage.url === "index.html"
                      }
                      data-story=""
                      text="Лента"
                      indicator={
                        storage.tour === 4 && <Badge mode="prominent" />
                      }
                    >
                      <Icon28NewsfeedOutline
                        className={!storage.navigation && "disabledNav"}
                      />
                    </TabbarItem>

                    <TabbarItem
                      onClick={URLChanger}
                      disabled={
                        !storage.navigation || storage.url === "subscriptions"
                      }
                      selected={storage.url === "subscriptions"}
                      data-story="subscriptions"
                      text="Подписки"
                      indicator={
                        (storage.tour === 3 || storage.tour === 2) && (
                          <Badge mode="prominent" />
                        )
                      }
                    >
                      <Icon28RssFeedOutline />
                    </TabbarItem>

                    <TabbarItem
                      onClick={URLChanger}
                      disabled={
                        !storage.navigation || storage.url === "services"
                      }
                      selected={storage.url === "services"}
                      data-story="services"
                      text="Сервисы"
                      indicator={
                        storage.tour === 1 && <Badge mode="prominent" />
                      }
                    >
                      <Icon28ServicesOutline
                        className={!storage.navigation && "disabledNav"}
                      />
                    </TabbarItem>

                    <TabbarItem
                      onClick={URLChanger}
                      disabled={!storage.navigation || storage.url === "rating"}
                      selected={storage.url === "rating"}
                      data-story="rating"
                      text="Популярные"
                      indicator={
                        storage.tour === 5 && <Badge mode="prominent" />
                      }
                    >
                      <Icon28FireOutline
                        className={!storage.navigation && "disabledNav"}
                      />
                    </TabbarItem>

                    <TabbarItem
                      onClick={URLChanger}
                      disabled={
                        !storage.navigation || storage.url === "profile"
                      }
                      selected={storage.url === "profile"}
                      data-story="profile"
                      text="Профиль"
                      indicator={
                        storage.tour === 6 && <Badge mode="prominent" />
                      }
                    >
                      <Icon28UserCircleOutline
                        className={!storage.navigation && "disabledNav"}
                      />
                    </TabbarItem>
                  </Tabbar>
                )
              }
            >
              <View
                id="default"
                activePanel="default"
                modal={modal}
                popout={popout}
              >
                <Panel id="default">
                  <Controller />
                  {snackbar}
                </Panel>
              </View>
            </Epic>
          </SplitCol>
        </SplitLayout>
      </Fragment>
    );
  },
  {
    viewWidth: true,
  }
);

export default App;
