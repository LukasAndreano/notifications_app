import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  Group,
  Placeholder,
  RichCell,
  Avatar,
  Footer,
  Spinner,
  Button,
  PanelHeader,
} from "@vkontakte/vkui";
import { Icon56NotificationOutline } from "@vkontakte/icons";
import api from "../service/improvedFetch";

import {
  setActiveModal,
  saveModalData,
  setUpdateURL,
  updateNotifications,
  setTime,
} from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import { useHistory } from "react-router-dom";

export default function Subscriptions() {
  const [loaded, setLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loader, setLoader] = useState(
    localStorage.getItem("subscriptions") === null
  );

  const history = useHistory();

  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);
  const subscriptionsStorage = useSelector((state) => state.subscriptions);

  const render = useCallback(
    (data, instantLoad = false) => {
      let arr = [];
      data.forEach((el) => {
        arr.push(
          <RichCell
            key={el.id}
            className="serviceCard"
            before={<Avatar size={48} mode="app" src={el.img} />}
            caption={el.description}
            onClick={() => {
              dispatch(setActiveModal("remove"));
              dispatch(
                saveModalData({
                  img: el.img,
                  data: el.data,
                  name: el.useServiceName === 1 ? el.name : el.description,
                  service_id: el.service_id,
                })
              );
            }}
          >
            {el.name}
          </RichCell>
        );
      });
      setNotifications(arr);
      if (arr.length !== 0 && storage.tour === 2) {
        setTimeout(() => dispatch(setActiveModal("tour3")), 1000);
      }
      if (instantLoad) setLoaded(true);
      else setTimeout(() => setLoaded(true), 100);
    },
    [dispatch, storage.tour]
  );

  useEffect(() => {
    if (subscriptionsStorage.updatePage)
      api("loadNotifications").then((data) => {
        if (data.response !== false) {
          render(data.response.notifications);
          localStorage.setItem(
            "subscriptions",
            JSON.stringify(data.response.notifications)
          );
          dispatch(setTime({ time: 0, value: data.response.user.time1 }));
          dispatch(setTime({ time: 1, value: data.response.user.time2 }));
        } else {
          setLoaded(true);
        }
      });
  }, [render, subscriptionsStorage.updatePage, dispatch]);

  useEffect(() => {
    if (!loaded) {
      const timeout = setTimeout(() => {
        if (!loaded) setLoader(true);
      }, 400);
      if (localStorage.getItem("subscriptions") === null)
        api("loadNotifications").then((data) => {
          if (data.response !== false) {
            render(data.response.notifications);
            clearTimeout(timeout);
            localStorage.setItem(
              "subscriptions",
              JSON.stringify(data.response.notifications)
            );
            dispatch(
              updateNotifications({
                notifications: data.response.user.notifications,
                group_notifications: data.response.user.group_notifications,
              })
            );
            dispatch(setTime({ time: 0, value: data.response.user.time1 }));
            dispatch(setTime({ time: 1, value: data.response.user.time2 }));
          } else {
            setLoaded(true);
          }
        });
      else {
        render(JSON.parse(localStorage.getItem("subscriptions")));
        setLoaded(true);
      }
    }
  }, [render, loaded, setLoader, dispatch]);

  return (
    <Fragment>
      <PanelHeader separator={storage.isDesktop}>
        {storage.isDesktop ? "Ваши подписки" : "Подписки"}
      </PanelHeader>
      <Group>
        {loaded ? (
          <Fragment>
            {notifications.length !== 0 ? (
              <Fragment>
                {storage.notifications === 0 &&
                  storage.group_notifications === 0 && (
                    <Fragment>
                      <Placeholder
                        style={{ marginBottom: -20, marginTop: -20 }}
                        icon={<Icon56NotificationOutline />}
                        header="Включите уведомления!"
                        action={
                          <Button
                            size="m"
                            onClick={() => {
                              history.push("/subscriptions/settings");
                              dispatch(setUpdateURL(true));
                              setTimeout(
                                () => dispatch(setUpdateURL(false)),
                                100
                              );
                            }}
                          >
                            Перейти в настройки
                          </Button>
                        }
                      >
                        Сейчас у Вас отключены уведомления. Мы не сможем
                        уведомить Вас, если что-то произойдет в том или ином
                        сервисе.
                      </Placeholder>
                    </Fragment>
                  )}
                {(storage.notifications !== 0 ||
                  storage.group_notifications !== 0) && (
                  <Placeholder
                    header="Подключенные сервисы"
                    style={{ marginBottom: -20, marginTop: -20 }}
                  >
                    Здесь отображён список всех подключенных каналов/источников
                    от различных сервисов. Если Вы захотите отключить какой-либо
                    канал или источник - просто нажмите на него.
                    <br />
                    <br />
                    Хотите изменить настройки получения уведомлений? Давайте
                    перенаправим Вас в специальный раздел.
                    <br />
                    <Button
                      size="m"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        history.push("/subscriptions/settings");
                        dispatch(setUpdateURL(true));
                        setTimeout(() => dispatch(setUpdateURL(false)), 100);
                      }}
                    >
                      Настройки уведомлений
                    </Button>
                  </Placeholder>
                )}
                {notifications}
                <Footer>
                  Подключено каналов/источников: {notifications.length}
                </Footer>
              </Fragment>
            ) : (
              <div
                style={{
                  height: "80vh",
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Placeholder
                  header="Тут совсем ничего нет!"
                  icon={<Icon56NotificationOutline />}
                >
                  Подключите свой первый сервис и начните получать уведомления.
                  Мы не дадим Вам пропустить что-то важное!
                </Placeholder>
              </div>
            )}
          </Fragment>
        ) : (
          loader && <Spinner size="medium" />
        )}
      </Group>
    </Fragment>
  );
}
