import React, { Fragment, useEffect, useState, useRef } from "react";
import bridge from "@vkontakte/vk-bridge";
import { Button, Group, Avatar, Div, Placeholder } from "@vkontakte/vkui";
import { Icon56UserSquareOutline } from "@vkontakte/icons";

import api from "../service/improvedFetch";
import { useDispatch } from "react-redux";
import { setSnackbar } from "../reducers/mainReducer";

let colors = [
  "#e67a7a",
  "#e6c07a",
  "#bbe67a",
  "#7adde6",
  "#7a8ae6",
  "#e67ae2",
  "#e67ab0",
];

export default function RandomSubscriber(props) {
  const [disabled, setDisabled] = useState(false);
  const [color, setColor] = useState("");
  const [data, setData] = useState(null);
  const [interval, setIntervalFunc] = useState();
  const [timeout, setTimeoutFunc] = useState();

  const dispatch = useDispatch();

  const componentWillUnmount = useRef(false);

  function getRandomSubscriber() {
    api("getRandomSubscriber").then((request) => {
      if (request.response) {
        let interval = setInterval(() => {
          setColor(colors[Math.floor(Math.random() * colors.length)]);
        }, 300);
        setIntervalFunc(interval);
        bridge
          .send("VKWebAppGetAuthToken", { app_id: 7915893, scope: "" })
          .then((data) => {
            bridge
              .send("VKWebAppCallAPIMethod", {
                method: "users.get",
                params: {
                  user_ids: request.data,
                  fields: "photo_100",
                  v: "5.131",
                  lang: "ru",
                  access_token: data.access_token,
                },
              })
              .then((data) => {
                let timeout = setTimeout(() => {
                  setColor("");
                  clearInterval(interval);
                  setData({
                    name:
                      data.response[0].first_name +
                      " " +
                      data.response[0].last_name,
                    avatar: data.response[0].photo_100,
                    id: request.data,
                  });
                }, 4000);
                setTimeoutFunc(timeout);
              });
          });
      } else if (request.errorCode === 1) {
        dispatch(
          setSnackbar({
            text: "К сожалению, в Вашей рассылке никого нет...",
            success: false,
          })
        );
        props.closeModal();
      }
    });
  }

  useEffect(() => {
    return () => {
      componentWillUnmount.current = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (componentWillUnmount.current) {
        clearInterval(interval);
        clearTimeout(timeout);
      }
    };
  }, [interval, timeout]);

  return (
    <Group>
      {!disabled || data === null ? (
        <Fragment>
          <Placeholder
            icon={<Icon56UserSquareOutline fill={color} />}
            header={
              disabled
                ? "Выбираем случайного подписчика..."
                : "Выбор случайного подписчика"
            }
            style={{ marginBottom: -40, marginTop: -30 }}
          >
            {disabled
              ? "Прямо сейчас происходит выбор случайного подписчика. Подождите..."
              : "Функция выбирает случайного подписчика из Вашей рассылки. Бывает полезно, например, при розыгрышах."}
          </Placeholder>
          <Div>
            <Button
              size="l"
              stretched
              loading={disabled}
              onClick={() => {
                setDisabled(true);
                getRandomSubscriber();
              }}
            >
              Запустить функцию
            </Button>
          </Div>
        </Fragment>
      ) : (
        <Fragment>
          <Placeholder
            icon={<Avatar size={72} src={data.avatar} />}
            header={data.name}
            style={{ marginBottom: -40, marginTop: -30 }}
          >
            Поздравляем, {data.name}! Система выбрала в качестве победителя
            именно тебя!
          </Placeholder>
          <Div>
            <Button
              size="l"
              stretched
              target="_blank"
              className="fixButton2"
              href={"https://vk.com/id" + data.id}
            >
              Открыть страницу
            </Button>
          </Div>
        </Fragment>
      )}
    </Group>
  );
}
