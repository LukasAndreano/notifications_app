import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Input,
  Footer,
  Placeholder,
  Avatar,
} from "@vkontakte/vkui";

import { setPopout, setSnackbar } from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import api from "../service/improvedFetch";
import { motion } from "framer-motion";

export default function Twitch(props) {
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const [channel, setChannel] = useState(
    storage.modalData.channel !== null &&
      storage.modalData.channel !== undefined
      ? storage.modalData.channel
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
        header="Подключение Twitch"
      >
        Для подключения уведомлений введите имя пользователя, которого Вы хотите
        отслеживать.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled && channel !== "" && channel.length >= 3) {
            api("connectService", "id=1&channel=" + channel).then((data) => {
              setDisabled(false);
              if (data.response) {
                dispatch(
                  setSnackbar({
                    text:
                      "Уведомления от " + channel.toLowerCase() + " включены!",
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
                    text: "Вы уже получаете уведомления от этого пользователя.",
                  })
                );
              } else if (data.message === "not_found") {
                dispatch(
                  setPopout({
                    title: "Ошибка!",
                    text: "Такого пользователя нет на платформе Twitch.",
                  })
                );
              }
            });
          }
        }}
      >
        <FormItem className="mb10">
          <Input
            placeholder="Логин стримера (например, Sfory)"
            maxLength="50"
            value={channel}
            required
            readOnly={
              storage.modalData.channel !== undefined &&
              storage.modalData.channel !== null
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
            disabled={channel === "" || channel.length < 3}
          >
            Подключить
          </Button>
        </FormItem>
      </FormLayout>
      <Footer style={{ paddingLeft: 10, paddingRight: 10, marginTop: 0 }}>
        Подсказка: регистр не имеет значения.
        <br />
        Например, Вы можете ввести пользователя Sfory в ином регистре: sFoRY.
      </Footer>
    </Group>
  );
}
