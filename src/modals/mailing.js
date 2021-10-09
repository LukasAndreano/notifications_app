import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Textarea,
  Placeholder,
} from "@vkontakte/vkui";
import { Icon56MailOutline } from "@vkontakte/icons";
import { useDispatch } from "react-redux";
import { setPopout } from "../reducers/mainReducer";

import api from "../service/improvedFetch";

export default function Mailing(props) {
  const [text, setText] = useState("");
  const [disabled, setDisabled] = useState(false);

  const dispatch = useDispatch();

  return (
    <Group>
      <Placeholder
        icon={<Icon56MailOutline />}
        header="Создание рассылки"
        style={{ marginBottom: -30, marginTop: -30 }}
      >
        Начните рассылку среди всех своих подписчиков, если нужно что-то
        сообщить. Уведомление придёт не только в личные сообщения, но также и в
        «Колокольчик». Использование нецензурной брани, кстати, запрещено.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          setDisabled(true);
          if (!disabled && text.length >= 10 && text.length <= 4000) {
            api("startMailing", "&text=" + encodeURI(text)).then((data) => {
              setDisabled(false);
              if (data.response) {
                setTimeout(
                  () =>
                    dispatch(
                      setPopout({
                        title: "Уведомление",
                        text: "Мы поместили Вашу рассылку в очередь. Через 30-60 секунд подписчики получат уведомление. Если в сообщении менее 254 символов, то рассылка придёт еще и в «Колокольчик».",
                      })
                    ),
                  100
                );
                props.closeModal();
              }
            });
          }
        }}
      >
        <FormItem className="mb10">
          <Textarea
            placeholder="Введите текст рассылки. Минимум - 10 символов, максимум - 4000."
            maxLength="4000"
            value={text}
            required
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
        </FormItem>
        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            loading={disabled}
            disabled={text === "" || text.length < 10}
          >
            Начать рассылку
          </Button>
        </FormItem>
      </FormLayout>
    </Group>
  );
}
