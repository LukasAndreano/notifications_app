import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Group, RichCell, Avatar, Placeholder } from "@vkontakte/vkui";
import { Icon56LikeOutline } from "@vkontakte/icons";

import { setPopout, setSnackbar } from "../reducers/mainReducer";
import { setUpdatePage } from "../reducers/subscriptionsReducer";
import { useDispatch, useSelector } from "react-redux";
import api from "../service/improvedFetch";

export default function ContentMakerServices(props) {
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState([]);
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const render = useCallback(
    (data) => {
      if (!loading) {
        setLoading(true);
        let arr = [];
        data.forEach((el) => {
          if (ids.indexOf(el.id) === -1) {
            arr.push(
              <RichCell
                key={el.id}
                className="serviceCard"
                before={<Avatar size={48} mode="app" src={el.img} />}
                caption={el.title !== undefined ? el.title : ""}
                onClick={() => {
                  api(
                    "connectService",
                    "id=" + el.id + "&channel=" + el.channel + "&useTag=true"
                  ).then((dataFetch) => {
                    if (dataFetch.response) {
                      let array = ids;
                      array.push(el.id);
                      setIds(array);
                      render(data);
                      dispatch(setUpdatePage(true));
                      setTimeout(() => dispatch(setUpdatePage(false)), 100);
                      dispatch(
                        setSnackbar({
                          text: "Сервис добавлен в Ваши подписки",
                          success: true,
                        })
                      );
                    } else if (dataFetch.message === "already_enabled") {
                      dispatch(
                        setPopout({
                          title: "Уведомление",
                          text: "Вы уже получаете уведомления от этого пользователя.",
                        })
                      );
                    } else if (dataFetch.message === "limit") {
                      dispatch(
                        setPopout({
                          title: "Ошибка!",
                          text: "Пользователи без подписки могут подключить максимум три сервиса.",
                        })
                      );
                    }
                  });
                }}
              >
                {el.name}
              </RichCell>
            );
          }
          if (ids.length === data.length) {
            props.closeModal();
          }
          setTimeout(() => {
            setList(arr);
            setLoading(false);
          }, 300);
        });
      }
    },
    [ids, loading, props, dispatch]
  );

  useEffect(() => {
    if (!loaded) {
      console.log(storage.modalData.contentMakerServices);
      render(storage.modalData.contentMakerServices);
      setLoaded(true);
    }
  }, [loaded, render, setLoaded, storage.modalData]);

  return (
    <Group>
      {list.length !== 0 && (
        <Fragment>
          <Placeholder
            icon={<Icon56LikeOutline />}
            header="Быстрая подписка"
            style={{ marginBottom: -30, marginTop: -30 }}
          >
            Предлагаем Вам подписаться на нижеперечисленные каналы и тем самым
            поддержать любимого контент-мейкера. Не забудьте потом включить
            уведомления в настройках!
          </Placeholder>
          {list}
        </Fragment>
      )}
    </Group>
  );
}
