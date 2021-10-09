import React, { useState } from "react";
import {
  FormLayout,
  Button,
  Group,
  FormItem,
  Input,
  Textarea,
  Placeholder,
} from "@vkontakte/vkui";
import { Icon56NotePenOutline } from "@vkontakte/icons";
import { useDispatch } from "react-redux";
import { setPopout } from "../reducers/mainReducer";

import api from "../service/improvedFetch";

export default function Request(props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const dispatch = useDispatch();

  return (
    <Group>
      <Placeholder
        icon={<Icon56NotePenOutline />}
        header="Заявка на получение прав контент-мейкера"
        style={{ marginBottom: -30, marginTop: -30 }}
      >
        После получение прав контент-мейкера Вы сможете создавать ссылки,
        перейдя по которым, пользователи автоматически подпишутся на Вас, а
        также делать ручную рассылку среди всех своих подписчиков.
      </Placeholder>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          let newName = name.trim();
          let newDescription = description.trim();
          setDisabled(true);
          if (
            !disabled &&
            newName.length >= 2 &&
            newDescription.length <= 3000 &&
            newDescription.length >= 50 &&
            newName.length <= 60
          ) {
            api(
              "sendRequest",
              "name=" +
                escape(newName) +
                "&description=" +
                escape(newDescription)
            ).then((data) => {
              setDisabled(false);
              if (data.response) {
                localStorage.setItem("request", "true");
                setTimeout(
                  () =>
                    dispatch(
                      setPopout({
                        title: "Заявка принята!",
                        text: "Администрация сервиса свяжется с Вами в случае одобрения/появления вопросов. Если Вы ещё не начали диалог с нашим сообществом, пожалуйста, исправьте это.",
                      })
                    ),
                  100
                );
                props.closeModal(null);
              }
            });
          } else {
            dispatch(
              setPopout({
                title: "Уведомление",
                text: "Проверьте правильность ввода данных. Возможно, Вы пытаетесь отправить пустое описание или имя - так делать нельзя.",
              })
            );
            setDisabled(false);
          }
        }}
      >
        <FormItem
          className="mb10"
          bottom={
            name.length > 60 &&
            "Это точно Ваше имя? Макс. количество символов - 60."
          }
          status={name.length > 60 && "error"}
        >
          <Input
            placeholder="Как Вас зовут?"
            maxLength="60"
            value={name}
            required
            onChange={(e) => {
              setName(
                e.target.value
                  .replace(/[0-9A-Za-z^!@#$%&*()_|/№:?;"'.,<>=-~]/gi, "")
                  .trim()
              );
            }}
          />
        </FormItem>
        <FormItem
          className="mb10"
          bottom={
            description.length > 3000 &&
            "Описание слишком большое. Макс. количество символов - 3000."
          }
          status={description.length > 3000 && "error"}
        >
          <Textarea
            placeholder="Перечислите площадки, на которых Вы создаёте контент (ссылки необходимы). Минимум 50 символов."
            maxLength="3000"
            value={description}
            required
            className="textAreaFix"
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </FormItem>
        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            loading={disabled}
            disabled={
              name === "" ||
              name.length < 2 ||
              description === "" ||
              description.length < 50 ||
              description.length > 3000 ||
              name.length > 60
            }
          >
            Отправить
          </Button>
        </FormItem>
      </FormLayout>
    </Group>
  );
}
