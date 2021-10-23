import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Placeholder,
  Avatar,
} from "@vkontakte/vkui";

import { setPopout, setSnackbar } from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import api from "../service/improvedFetch";
import { motion } from "framer-motion";

export default function KITEK(props) {
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

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
        header="Подключение уведомлений от сервиса Go-Paladins.ru"
      >
        Сервис уведомляет пользователя при добавлении новых гайдов на персонажей
        игры Paladins.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled) {
            api("connectService", "id=8").then((data) => {
              setDisabled(false);
              if (data.response) {
                dispatch(
                  setSnackbar({
                    text: "Уведомления от «Go-Paladins.ru» включены!",
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
                    text: "Вы уже получаете уведомления от этого сервиса.",
                  })
                );
              }
            });
          }
        }}
      >
        <FormItem>
          <Button size="l" stretched type="submit" loading={disabled}>
            Подключить
          </Button>
        </FormItem>
      </FormLayout>
    </Group>
  );
}
