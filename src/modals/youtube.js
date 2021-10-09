import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Placeholder,
  Input,
  Footer,
  Avatar,
} from "@vkontakte/vkui";

import { setPopout, setSnackbar } from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import api from "../service/improvedFetch";
import { motion } from "framer-motion";

export default function YouTube(props) {
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const [channel, setChannel] = useState(
    storage.modalData.channel_id !== undefined
      ? storage.modalData.channel_id
      : ""
  );
  const [disabled, setDisabled] = useState(false);

  return (
    <Group>
      <Placeholder
        style={{ marginTop: -30, marginBottom: -40 }}
        className="serviceCard"
        icon={
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Avatar mode="app" src={storage.modalData.img} size={72} />
          </motion.div>
        }
        header="Подключение YouTube"
      >
        Для подключения уведомлений введите прямую ссылку на канал, который Вы
        хотите отслеживать.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled && channel !== "" && channel.length >= 20) {
            api("connectService", "id=2&channel=" + encodeURI(channel)).then(
              (data) => {
                setDisabled(false);
                if (data.response) {
                  dispatch(
                    setSnackbar({
                      text:
                        "Уведомления от канала «" +
                        data.channel +
                        "» включены!",
                      success: true,
                    })
                  );
                  localStorage.removeItem("subscriptions");
                  setTimeout(() => props.closeModal(), 100);
                } else if (data.message === "limit") {
                  dispatch(
                    setPopout({
                      title: "Ошибка!",
                      text: "Пользователи без подписки могут подключить максимум три сервиса.",
                    })
                  );
                } else if (data.message === "already_enabled") {
                  dispatch(
                    setPopout({
                      title: "Остановитесь!",
                      text: "Вы уже получаете уведомления от этого канала.",
                    })
                  );
                } else if (data.message === "not_found") {
                  dispatch(
                    setPopout({
                      title: "Ошибка!",
                      text: "Такого канала нет на платформе YouTube или ссылка некорректна. Пожалуйста, указывайте прямые ссылки (подробнее на стене сообщества).",
                    })
                  );
                }
              }
            );
          }
        }}
      >
        <FormItem className="mb10">
          <Input
            placeholder="https://youtube.com/channel/UC1XLQIzXJd_KaLOuEVFESVw"
            maxLength="200"
            value={channel}
            required
            readOnly={
              storage.modalData.channel_id !== undefined &&
              storage.modalData.channel_id !== null
            }
            onChange={(e) => {
              setChannel(e.target.value.trim().replace(/[а-яА-ЯёЁ]/g, ""));
            }}
          />
        </FormItem>
        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            loading={disabled}
            disabled={channel === "" || channel.length < 20}
          >
            Подключить
          </Button>
        </FormItem>
      </FormLayout>
      <Footer style={{ paddingLeft: 10, paddingRight: 10, marginTop: 0 }}>
        Подсказка: в адресе не должно быть лишних путей и адрес не должен быть
        сокращён. Например, если Вы введёте
        .../UC1XLQIzXJd_KaLOuEVFESVw/featured, а не
        .../UC1XLQIzXJd_KaLOuEVFESVw, то Вы получите ошибку.
      </Footer>
    </Group>
  );
}
