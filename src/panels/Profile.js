import React, { useState, useEffect, Fragment, useCallback } from "react";
import bridge from "@vkontakte/vk-bridge";
import { useSelector, useDispatch } from "react-redux";
import {
  Group,
  ContentCard,
  RichCell,
  Avatar,
  PanelHeader,
  Div,
  PullToRefresh,
  SimpleCell,
  Header,
  Spinner,
} from "@vkontakte/vkui";
import {
  Icon28FavoriteOutline,
  Icon28Users3Outline,
  Icon28UserStarBadgeOutline,
  Icon28MessageAddBadgeOutline,
  Icon28UserOutgoingOutline,
  Icon28QuestionOutline,
  Icon28UserOutline,
  Icon28LightbulbOutline,
  Icon28ChainOutline,
  Icon28MailOutline,
} from "@vkontakte/icons";

import { setActiveModal, setSnackbar, saveTag } from "../reducers/mainReducer";
import api from "../service/improvedFetch";

export default function Profile() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState({ pro: 0, status: 0 });
  const [loader, setLoader] = useState(
    localStorage.getItem("profile") === null
  );

  const [fetching, setFetching] = useState(false);
  const [updated, setUpdated] = useState(false);

  const storage = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const fetchingFunc = useCallback((fetchingUse = false) => {
    if (fetchingUse) setFetching(true);
    api("getProfile").then((data) => {
      if (data.response !== false && data.response.length !== 0) {
        setData({
          pro: data.response.pro,
          status: data.response.status,
        });
        localStorage.setItem("profile", JSON.stringify(data.response));
        if (data.response.status === 1)
          localStorage.setItem("link", data.response.link);
        if (fetchingUse) {
          setFetching(false);
        }
        setTimeout(() => setLoaded(true), 100);
      } else {
        setLoaded(true);
        setUpdated(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!loaded && updated === false) {
      const timeout = setTimeout(() => {
        if (!loaded) setLoader(true);
      }, 400);
      setUpdated(true);
      if (
        localStorage.getItem("profile") !== null &&
        localStorage.getItem("profile").length !== 0
      ) {
        let data = JSON.parse(localStorage.getItem("profile"));
        setData({ pro: data.pro, status: data.status });
        setLoaded(true);
        clearTimeout(timeout);
      } else {
        fetchingFunc();
        clearTimeout(timeout);
      }
    }
  }, [loaded, updated, fetchingFunc]);

  return (
    <Fragment>
      <PanelHeader separator={storage.isDesktop}>
        Профиль
      </PanelHeader>
      <PullToRefresh onRefresh={() => fetchingFunc(true)} isFetching={fetching}>
        <Group style={{ paddingLeft: 5, paddingRight: 5 }}>
          {loaded ? (
            <Fragment>
              {sessionStorage.getItem("platform") !== "mobile_iphone" &&
                sessionStorage.getItem("platform") !==
                  "mobile_iphone_messenger" &&
                data.pro === 0 && (
                  <Div style={{ marginTop: -10 }}>
                    <ContentCard
                      onClick={() => {
                        dispatch(setActiveModal("donut"));
                      }}
                      header="Надоели лимиты и хочется эксклюзивных функций?"
                      caption="Подключите подписку VK Donut прямо сейчас и получите доступ ко всему функционалу! Чтобы узнать подробнее о подписке, нажмите здесь."
                    />
                  </Div>
                )}
              <RichCell
                disabled
                multiline
                before={<Avatar size={56} src={storage.user.photo_100} />}
                text={
                  sessionStorage.getItem("platform") !== "mobile_iphone" &&
                  sessionStorage.getItem("platform") !==
                    "mobile_iphone_messenger" &&
                  (data.pro === 1
                    ? "Подписка: активирована"
                    : "Подписка: отсутствует")
                }
                caption={
                  localStorage.getItem("request") === true
                    ? "Подана заявка на контент-мейкера"
                    : data.status === 1
                    ? "Контент-мейкер"
                    : data.status === 0
                    ? "Обычный пользователь"
                    : (data.status === 2 ||
                        localStorage.getItem("request") === false) &&
                      "Подана заявка на контент-мейкера"
                }
              >
                <span
                  dangerouslySetInnerHTML={{ __html: storage.user.first_name }}
                />{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: storage.user.last_name }}
                />
              </RichCell>
              {data.status === 1 && (
                <Fragment>
                  <Header mode="secondary">Функции контент-мейкера</Header>
                  <SimpleCell
                    onClick={() => {
                      if (localStorage.getItem("link") === null) {
                        dispatch(setActiveModal("setLink"));
                      } else {
                        dispatch(setActiveModal("refLink"));
                        dispatch(saveTag(localStorage.getItem("link")));
                      }
                    }}
                    expandable
                    before={<Icon28ChainOutline />}
                  >
                    Ссылка на подписку
                  </SimpleCell>
                  <SimpleCell
                    onClick={() => dispatch(setActiveModal("startMailing"))}
                    expandable
                    before={<Icon28MailOutline />}
                  >
                    Рассылка для подписчиков
                  </SimpleCell>
                  <SimpleCell
                    onClick={() => dispatch(setActiveModal("randomSubscriber"))}
                    expandable
                    before={<Icon28UserOutline />}
                  >
                    Случайный подписчик
                  </SimpleCell>
                </Fragment>
              )}
              <Header mode="secondary">Различные функции</Header>
              {Number(sessionStorage.getItem("favorites")) === 0 && (
                <SimpleCell
                  onClick={() =>
                    bridge.send("VKWebAppAddToFavorites").then((data) => {
                      if (data.result === true) {
                        sessionStorage.setItem("favorites", "1");
                        dispatch(
                          setSnackbar({
                            text: "Сервис добавлен в «Избранное»!",
                            success: true,
                          })
                        );
                      }
                    })
                  }
                  expandable
                  before={<Icon28FavoriteOutline />}
                >
                  Добавить в избранное
                </SimpleCell>
              )}
              <SimpleCell
                onClick={() =>
                  bridge.send("VKWebAppAddToCommunity").then((data) => {
                    if (data.group_id !== undefined && data.group_id !== null) {
                      dispatch(
                        setSnackbar({
                          text: "Сервис добавлен в сообщество!",
                          success: true,
                        })
                      );
                    }
                  })
                }
                expandable
                before={<Icon28Users3Outline />}
              >
                Установить сервис в группу
              </SimpleCell>
              {data.status === 0 && localStorage.getItem("request") === null && (
                <SimpleCell
                  expandable
                  before={<Icon28UserStarBadgeOutline />}
                  onClick={() =>
                    dispatch(setActiveModal("contentMakerRequest"))
                  }
                >
                  Стать контент-мейкером
                </SimpleCell>
              )}
              <SimpleCell
                onClick={() => dispatch(setActiveModal("tour1"))}
                expandable
                before={<Icon28LightbulbOutline />}
              >
                Пройти гайд
              </SimpleCell>
              <Header mode="secondary">Другое</Header>
              <a
                href="https://vk.com/@notificationsapp-start-guide"
                target="_blank"
                rel="noreferrer"
              >
                <SimpleCell expandable before={<Icon28QuestionOutline />}>
                  Открыть FAQ
                </SimpleCell>
              </a>
              <a
                href="https://vk.com/club206215182"
                target="_blank"
                rel="noreferrer"
              >
                <SimpleCell expandable before={<Icon28UserOutgoingOutline />}>
                  Перейти в сообщество
                </SimpleCell>
              </a>
              <a
                href="https://vk.com/id172118960"
                target="_blank"
                rel="noreferrer"
              >
                <SimpleCell
                  expandable
                  before={<Icon28MessageAddBadgeOutline />}
                >
                  Связь с разработчиком
                </SimpleCell>
              </a>
            </Fragment>
          ) : (
            loader && <Spinner size="medium" />
          )}
        </Group>
      </PullToRefresh>
    </Fragment>
  );
}
