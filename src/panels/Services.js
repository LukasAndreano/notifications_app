import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  Group,
  Placeholder,
  Spinner,
  RichCell,
  Avatar,
  Footer,
  PanelHeader,
} from "@vkontakte/vkui";
import api from "../service/improvedFetch";

import { setActiveModal, saveModalData } from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

export default function Services() {
  const [loaded, setLoaded] = useState(false);
  const [services, setServices] = useState([]);
  const [loader, setLoader] = useState(
    localStorage.getItem("services") === null
  );
  const [updated, setUpdated] = useState(false);

  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const render = useCallback(
    (data) => {
      let arr = [];
      data.forEach((el) => {
        arr.push(
          <RichCell
            key={el.id}
            className="serviceCard"
            before={<Avatar size={48} mode="app" src={el.img} />}
            caption={el.description}
            onClick={() => {
              dispatch(setActiveModal(String(el.id)));
              dispatch(saveModalData({ img: el.img }));
            }}
          >
            {el.name}
          </RichCell>
        );
      });
      setServices(arr);
      setLoaded(true);
      setUpdated(false);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!loaded && updated === false) {
      setUpdated(true);
      const timeout = setTimeout(() => {
        if (!loaded) setLoader(true);
      }, 400);
      if (
        localStorage.getItem("services") !== null &&
        localStorage.getItem("services").length !== 0
      ) {
        render(JSON.parse(localStorage.getItem("services")));
        clearTimeout(timeout);
      } else {
        clearTimeout(timeout);
        api("loadServices").then((data) => {
          if (data.response !== false && data.response.length !== 0) {
            render(data.response);
            localStorage.setItem("services", JSON.stringify(data.response));
          }
        });
      }
    }
  }, [updated, loaded, render, setLoader]);

  return (
    <Fragment>
      <PanelHeader separator={storage.isDesktop}>
        {storage.isDesktop ? "Доступные сервисы" : "Сервисы"}
      </PanelHeader>
      <Group>
        <Placeholder
          header="Доступные сервисы"
          style={{ marginBottom: -20, marginTop: -20 }}
        >
          Здесь отображены все доступные для подключения сервисы. Нажмите на
          нужный сервис, введите дополнительные параметры, и всё - уведомления
          подключены!
        </Placeholder>
        {loaded ? (
          <Fragment>
            {services}
            <Footer>
              Всего доступно сервисов в каталоге: {services.length}
            </Footer>
          </Fragment>
        ) : (
          loader && <Spinner size="medium" />
        )}
      </Group>
    </Fragment>
  );
}
