import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  Group,
  Placeholder,
  RichCell,
  Avatar,
  Spinner,
  PanelHeader,
  PullToRefresh,
} from "@vkontakte/vkui";
import { Icon56GhostOutline } from "@vkontakte/icons";

import { useSelector, useDispatch } from "react-redux";
import { saveData, setLoaded } from "../reducers/feedReducer";
import { setActiveModal, saveModalData } from "../reducers/mainReducer";
import api from "../service/improvedFetch";

export default function Feed() {
  const [loaded, setLoadedFeed] = useState(false);
  const [feed, setFeed] = useState([]);
  const [useLoader, setUseLoader] = useState(false);
  const [fetching, setFetching] = useState(false);

  const feedStorage = useSelector((state) => state.feed);
  const storage = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const render = useCallback(
    (data) => {
      let arr = [];
      let i = 0;
      data.forEach((el) => {
        const date = el.time.length === 13 && new Date(Number(el.time));
        const time =
          el.time.length === 13
            ? date.toLocaleString("ru-RU", {
                month: "long",
                day: "numeric",
              }) +
              ", " +
              date.getHours() +
              ":" +
              ("0" + date.getMinutes()).slice(-2)
            : el.time;
        arr.push(
          <RichCell
            key={i}
            multiline
            onClick={() => {
              dispatch(setActiveModal("wallEvent"));
              dispatch(
                saveModalData({
                  img: el.img,
                  header: el.message,
                  subheader: el.description,
                  time: time,
                })
              );
            }}
            className="serviceCard tw"
            before={<Avatar size={48} mode="app" src={el.img} />}
            caption={el.description}
            after={time}
          >
            {el.message}
          </RichCell>
        );
        i = i + 1;
      });
      setFeed(arr);
      setLoadedFeed(true);
      setFetching(false);
    },
    [setLoadedFeed, dispatch]
  );

  const renderByFetch = useCallback(
    (fetchingFunc = false) => {
      if (fetchingFunc) setFetching(true);
      api("loadFeed")
        .then((data) => {
          if (data.response !== false) {
            render(data.response);
            dispatch(saveData(data.response));
          }
        })
        .catch(() => {
          setFetching(false);
        });
    },
    [render, dispatch]
  );

  useEffect(() => {
    if (!feedStorage.loaded) {
      dispatch(setLoaded(true));
      renderByFetch();
      setUseLoader(true);
    } else if (feedStorage.data !== null && !loaded) {
      render(feedStorage.data);
    }
  }, [feedStorage, dispatch, renderByFetch, render, loaded]);

  return (
    <Fragment>
      <PanelHeader separator={storage.isDesktop ? true : false}>
        {storage.isDesktop ? "Лента уведомлений" : "Лента"}
      </PanelHeader>
      <PullToRefresh
        onRefresh={() => renderByFetch(true)}
        isFetching={fetching}
      >
        <Group>
          {feedStorage.loaded && loaded ? (
            <Fragment>
              {feed.length === 0 ? (
                <div
                  style={{
                    height: "80vh",
                    display: "flex",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Placeholder
                    style={{ marginBottom: -20, marginTop: -20 }}
                    icon={<Icon56GhostOutline />}
                    header="Что-то тут тихо... даже слишком"
                  >
                    Как только Вы получите хоть одно уведомление - оно
                    отобразится здесь. В ленте может находиться до 100
                    уведомлений.
                  </Placeholder>
                </div>
              ) : (
                feed
              )}
            </Fragment>
          ) : (
            useLoader && <Spinner size="medium" />
          )}
        </Group>
      </PullToRefresh>
    </Fragment>
  );
}
