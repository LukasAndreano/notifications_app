import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Input,
  Placeholder,
  Avatar,
  Footer,
} from "@vkontakte/vkui";

import { setPopout, setSnackbar } from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import api from "../service/improvedFetch";
import { motion } from "framer-motion";

export default function Steam(props) {
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const [id, setID] = useState(
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
        header="Подключение Steam"
      >
        Для подключения уведомлений вставьте ссылку или ID приложения/игры в
        поле ниже. Ссылка автоматически превратится в нужный нам ID.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled && id !== "" && id.length >= 1) {
            api("connectService", "id=7&app_id=" + id).then((data) => {
              setDisabled(false);
              if (data.response) {
                dispatch(
                  setSnackbar({
                    text: "Уведомления от " + data.app_name + " включены!",
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
                    text: "Вы уже получаете уведомления от этого приложения или игры.",
                  })
                );
              } else if (data.message === "not_found") {
                dispatch(
                  setPopout({
                    title: "Ошибка!",
                    text: "Такого приложения или игры нет на платформе Steam.",
                  })
                );
              }
            });
          }
        }}
      >
        <FormItem className="mb10">
          <Input
            placeholder="https://store.steampowered.com/app/304930/Unturned/"
            maxLength="50"
            value={id}
            required
            readOnly={
              storage.modalData.app_id !== undefined &&
              storage.modalData.app_id !== null
            }
            onChange={(e) => {
              let appID = e.target.value.trim().split("/app/")[1];
              if (appID !== undefined) appID = appID.split("/")[0];
              else appID = e.target.value.trim().replace(/[^0-9]/g, "");

              setID(appID);
            }}
          />
        </FormItem>
        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            loading={disabled}
            disabled={id === "" || id.length < 1}
          >
            Подключить
          </Button>
        </FormItem>
      </FormLayout>
      <Footer style={{ paddingLeft: 10, paddingRight: 10, marginTop: 0 }}>
        Пример ссылки, которую нужно вставить в поле ниже:
        https://store.steampowered.com/app/304930/Unturned/.
      </Footer>
    </Group>
  );
}
