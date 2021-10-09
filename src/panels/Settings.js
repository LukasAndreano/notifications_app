import React, { useState, useEffect, Fragment } from "react";
import bridge from "@vkontakte/vk-bridge";
import {
  Group,
  Placeholder,
  Card,
  Spinner,
  Select,
  FormLayoutGroup,
  FormItem,
  CustomSelectOption,
  PanelHeaderBack,
  Switch,
  Div,
  PanelHeader,
  Cell,
} from "@vkontakte/vkui";

import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import {
  updateNotifications,
  setActiveModal,
  setTime,
  setSnackbar,
} from "../reducers/mainReducer";

import api from "../service/improvedFetch";

let time = [
  { value: 0, label: "00:00" },
  { value: 1, label: "01:00" },
  { value: 2, label: "02:00" },
  { value: 3, label: "03:00" },
  { value: 4, label: "04:00" },
  { value: 5, label: "05:00" },
  { value: 6, label: "06:00" },
  { value: 7, label: "07:00" },
  { value: 8, label: "08:00" },
  { value: 9, label: "09:00" },
  { value: 10, label: "10:00" },
  { value: 11, label: "11:00" },
  { value: 12, label: "12:00" },
  { value: 13, label: "13:00" },
  { value: 14, label: "14:00" },
  { value: 15, label: "15:00" },
  { value: 16, label: "16:00" },
  { value: 17, label: "17:00" },
  { value: 18, label: "18:00" },
  { value: 19, label: "19:00" },
  { value: 20, label: "20:00" },
  { value: 21, label: "21:00" },
  { value: 22, label: "22:00" },
  { value: 23, label: "23:00" },
];

export default function Settings() {
  const storage = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const [loader, setLoader] = useState(false);
  const [switchLoaded1, setSwitchLoaded1] = useState(true);
  const [switchLoaded2, setSwitchLoaded2] = useState(true);

  const [blockSwitch, setBlockSwitch] = useState(false);

  const history = useHistory();

  useEffect(() => {
    if (storage.updateSwitchers) {
      setLoader(true);
      setTimeout(() => setLoader(false), 400);
    }
  }, [storage.updateSwitchers]);

  function changeTime(value, state) {
    if (value !== storage.time[state])
      api("setTime", "time=" + state + "&value=" + value).then((data) => {
        if (!data.response)
          dispatch(
            setSnackbar({ text: "Что-то пошло не так...", success: false })
          );
      });

    dispatch(setTime({ value, time: state }));
  }

  return (
    <Fragment>
      <PanelHeader
        left={<PanelHeaderBack onClick={() => history.goBack()} />}
        separator={storage.isDesktop ? true : false}
      >
        {storage.isDesktop ? "Настройки уведомлений" : "Настройки"}
      </PanelHeader>
      <Group>
        {!loader ? (
          <Fragment>
            <Placeholder style={{ marginTop: -20, marginBottom: -35 }}>
              Уведомления от сообщества будут приходить Вам в личные сообщения,
              а от сервиса в «колокольчик» (раздел уведомлений).
            </Placeholder>
            <Cell
              onClick={() => {
                if (!blockSwitch) {
                  setBlockSwitch(true);
                  if (storage.group_notifications === 0) {
                    bridge
                      .send("VKWebAppAllowMessagesFromGroup", {
                        group_id: 206215182,
                      })
                      .then((data) => {
                        if (data.result) {
                          api("enableNotificationsFromGroup").then((data) => {
                            if (data.response) {
                              if (storage.tour === 3) {
                                setTimeout(
                                  () => dispatch(setActiveModal("tour4")),
                                  500
                                );
                              }
                              setTimeout(() => {
                                setBlockSwitch(false);
                              }, 300);
                              setSwitchLoaded1(false);
                              dispatch(
                                updateNotifications({
                                  notifications: storage.notifications,
                                  group_notifications: 1,
                                })
                              );
                              setTimeout(() => setSwitchLoaded1(true), 100);
                            }
                          });
                        }
                      })
                      .catch(() => {
                        setBlockSwitch(false);
                      });
                  } else {
                    api("disableNotificationsFromGroup").then((data) => {
                      if (data.response) {
                        setSwitchLoaded1(false);
                        setTimeout(() => {
                          setBlockSwitch(false);
                        }, 300);
                        dispatch(
                          updateNotifications({
                            notifications: storage.notifications,
                            group_notifications: 0,
                          })
                        );
                        setTimeout(() => setSwitchLoaded1(true), 100);
                      }
                    });
                  }
                }
              }}
              after={
                switchLoaded1 ? (
                  <Switch
                    disabled={blockSwitch}
                    className="switchEl"
                    defaultChecked={storage.group_notifications === 1}
                  />
                ) : (
                  <Spinner size="small" style={{ marginRight: 10 }} />
                )
              }
            >
              Уведомления от сообщества
            </Cell>
            <Cell
              onClick={() => {
                if (!blockSwitch) {
                  setBlockSwitch(true);
                  if (storage.notifications === 0) {
                    bridge
                      .send("VKWebAppAllowNotifications")
                      .then((data) => {
                        if (data.result) {
                          api("enableNotificationsFromApp").then((data) => {
                            if (data.response) {
                              dispatch(
                                updateNotifications({
                                  notifications: 1,
                                  group_notifications:
                                    storage.group_notifications,
                                })
                              );
                              setTimeout(() => {
                                setBlockSwitch(false);
                              }, 300);
                              if (storage.tour === 3) {
                                setTimeout(
                                  () => dispatch(setActiveModal("tour4")),
                                  500
                                );
                              }
                              setSwitchLoaded2(false);
                              setTimeout(() => setSwitchLoaded2(true), 100);
                            }
                          });
                        }
                      })
                      .catch(() => {
                        setBlockSwitch(false);
                      });
                  } else {
                    api("disableNotificationsFromApp").then((data) => {
                      if (data.response) {
                        setTimeout(() => {
                          setBlockSwitch(false);
                        }, 300);
                        setSwitchLoaded2(false);
                        dispatch(
                          updateNotifications({
                            notifications: 0,
                            group_notifications: storage.group_notifications,
                          })
                        );
                        setTimeout(() => setSwitchLoaded2(true), 100);
                      }
                    });
                  }
                }
              }}
              after={
                switchLoaded2 ? (
                  <Switch
                    className="switchEl"
                    disabled={blockSwitch}
                    defaultChecked={storage.notifications === 1}
                  />
                ) : (
                  <Spinner size="small" style={{ marginRight: 10 }} />
                )
              }
            >
              Уведомления от сервиса
            </Cell>
            {storage.notifications === 1 && (
              <Div>
                <Card>
                  <Placeholder style={{ marginBottom: -20 }}>
                    Выберите время, когда Вы хотите получать уведомления от
                    сервиса в «колокольчик» и в личные сообщения. Если выбрать
                    два одинаковых параметра, то настройка отключится. Часовой
                    пояс: GMT+3.
                  </Placeholder>
                  <FormLayoutGroup mode="horizontal">
                    <FormItem top="с">
                      <Select
                        options={time}
                        value={storage.time[0]}
                        onChange={(e) => changeTime(e.target.value, 0)}
                        renderOption={({ option, ...restProps }) => (
                          <CustomSelectOption {...restProps} />
                        )}
                      />
                    </FormItem>
                    <FormItem top="до">
                      <Select
                        options={time}
                        value={storage.time[1]}
                        onChange={(e) => changeTime(e.target.value, 1)}
                        renderOption={({ option, ...restProps }) => (
                          <CustomSelectOption {...restProps} />
                        )}
                      />
                    </FormItem>
                  </FormLayoutGroup>
                </Card>
              </Div>
            )}
          </Fragment>
        ) : (
          <Spinner size="medium" />
        )}
      </Group>
    </Fragment>
  );
}
