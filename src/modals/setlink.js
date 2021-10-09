import React, { useState } from "react";
import bridge from "@vkontakte/vk-bridge";
import { useDispatch } from "react-redux";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Input,
  Placeholder,
} from "@vkontakte/vkui";
import { Icon56NotePenOutline } from "@vkontakte/icons";
import { saveTag, setPopout } from "../reducers/mainReducer";

import api from "../service/improvedFetch";

export default function SetLink(props) {
  const dispatch = useDispatch();

  const [tag, setTag] = useState("");
  const [disabled, setDisabled] = useState(false);

  return (
    <Group>
      <Placeholder
        icon={<Icon56NotePenOutline />}
        header="Создание ссылки"
        style={{ marginBottom: -30, marginTop: -30 }}
      >
        Контент-мейкеры могут создавать собственные ссылки, перейдя по которым
        пользователю будет предложено подписаться на один или несколько
        сервисов, которые Вы указали в заявке.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled && tag.length >= 2 && tag.length <= 50) {
            api("setLink", "tag=" + encodeURI(tag)).then((data) => {
              setDisabled(false);
              if (data.response) {
                bridge.send("VKWebAppCopyText", {
                  text: "https://vk.com/app7915893#" + tag,
                });
                dispatch(saveTag(tag));
                localStorage.setItem("link", tag);
                props.closeModal();
                setTimeout(() => {
                  dispatch(
                    setPopout({
                      title: "Ссылка изменена!",
                      text: "Вы успешно изменили ссылку. Мы её скопировали в Ваш будет обмена.",
                    })
                  );
                }, 500);
                localStorage.setItem("link", tag);
              } else if (data.message === "already_setted") {
                dispatch(
                  setPopout({
                    title: "Уведомление",
                    text: "Такая ссылка уже существует. Придумайте что-нибудь другое.",
                  })
                );
              }
            });
          } else {
            setDisabled(false);
          }
        }}
      >
        <FormItem className="mb10">
          <Input
            placeholder="irman"
            maxLength="50"
            value={tag}
            required
            onChange={(e) => {
              setTag(
                e.target.value
                  .replace(/[@+#+*+?+&+%++]/gi, "")
                  .replace(/\n/, "")
                  .trim()
              );
            }}
          />
        </FormItem>
        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            loading={disabled}
            disabled={tag === "" || tag.length < 2 || tag.length >= 50}
          >
            Сохранить
          </Button>
        </FormItem>
      </FormLayout>
    </Group>
  );
}
