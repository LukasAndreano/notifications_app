import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  useCallback,
} from "react";
import {
  Group,
  Avatar,
  Div,
  PullToRefresh,
  RichCell,
  SubnavigationBar,
  SubnavigationButton,
  Spinner,
  ContentCard,
  PanelHeader,
  Placeholder,
} from "@vkontakte/vkui";
import { Icon16Verified, Icon56Stars3Outline } from "@vkontakte/icons";

import {
  setActiveModal,
  setSnackbar,
  saveModalData,
} from "../reducers/mainReducer";
import { useDispatch, useSelector } from "react-redux";

import api from "../service/improvedFetch";

export default function Feed() {
  const [loaded, setLoaded] = useState(false);
  const [youtube, setYoutube] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [loader, setLoader] = useState(localStorage.getItem("rating") === null);
  const [twitch, setTwitch] = useState([]);
  const [goodgame, setGoodGame] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [activePanel, setActivePanel] = useState("youtube");

  const [timeout, setTimeoutFunc] = useState();
  const componentWillUnmount = useRef(false);

  const dispatch = useDispatch();
  const storage = useSelector((state) => state.main);

  const render = useCallback(
    (data, push = false, instantLoad = false) => {
      let arr = [];
      let arr2 = [];
      let arr4 = [];
      let i = 1;
      data.response.youtube.forEach((el) => {
        arr.push(
          <RichCell
            key={el.id}
            onClick={() => {
              dispatch(setActiveModal("2"));
              dispatch(
                saveModalData({
                  channel_id: "https://www.youtube.com/channel/" + el.data,
                  img: el.img,
                })
              );
            }}
            className="AvatarWithoutShadow"
            before={
              <Avatar size={48} mode="app">
                <div className="TopPosition">{i}</div>
                <span className="TopText" style={{ marginTop: -4 }}>
                  {el.description.substr(0, 1)}
                </span>
              </Avatar>
            }
            caption={"Подписчиков: " + el.count}
          >
            <span style={{ display: "inline-flex" }}>
              {el.description}{" "}
              {el.verifed === 1 && (
                <Icon16Verified className="verifyMark" fill="#71AAEB" />
              )}
            </span>
          </RichCell>
        );
        i = i + 1;
      });
      i = 1;
      data.response.twitch.forEach((el) => {
        arr2.push(
          <RichCell
            key={el.id}
            onClick={() => {
              dispatch(setActiveModal("1"));
              dispatch(
                saveModalData({
                  channel: el.description,
                  img: el.img,
                })
              );
            }}
            className="AvatarWithoutShadow"
            before={
              <Avatar size={48} mode="app">
                <div className="TopPosition">{i}</div>
                <span className="TopText" style={{ marginTop: -4 }}>
                  {el.description.substr(0, 1)}
                </span>
              </Avatar>
            }
            caption={"Подписчиков: " + el.count}
          >
            <span style={{ display: "inline-flex" }}>
              {el.description}{" "}
              {el.verifed === 1 && (
                <Icon16Verified className="verifyMark" fill="#71AAEB" />
              )}
            </span>
          </RichCell>
        );
        i = i + 1;
      });
      i = 1;
      data.response.goodgame.forEach((el) => {
        arr4.push(
          <RichCell
            key={el.id}
            onClick={() => {
              dispatch(setActiveModal("4"));
              dispatch(
                saveModalData({
                  channel: el.description,
                  img: el.img,
                })
              );
            }}
            className="AvatarWithoutShadow"
            before={
              <Avatar size={48} mode="app">
                <div className="TopPosition">{i}</div>
                <span className="TopText" style={{ marginTop: -4 }}>
                  {el.description.substr(0, 1)}
                </span>
              </Avatar>
            }
            caption={"Подписчиков: " + el.count}
          >
            <span style={{ display: "inline-flex" }}>
              {el.description}{" "}
              {el.verifed === 1 && (
                <Icon16Verified className="verifyMark" fill="#71AAEB" />
              )}
            </span>
          </RichCell>
        );
        i = i + 1;
      });
      setYoutube(arr);
      setTwitch(arr2);
      setGoodGame(arr4);
      setUpdated(false);
      setFetching(false);
      if (instantLoad) setLoaded(true);
      else setTimeout(() => setLoaded(true), 100);
      if (push) {
        dispatch(setSnackbar({ text: "Рейтинг обновлен!", success: true }));
      }
    },
    [dispatch]
  );

  const renderByFetch = useCallback(
    (fetchingFunc = false) => {
      if (fetchingFunc) setFetching(true);
      api("getRating").then((data) => {
        if (data.response !== false) {
          render(data, fetchingFunc);
          clearTimeout(timeout);
          localStorage.setItem("rating", JSON.stringify(data));
        } else {
          setLoaded(true);
        }
      });
    },
    [render, timeout]
  );

  useEffect(() => {
    if (!loaded && !updated) {
      setUpdated(true);
      const timeout = setTimeout(() => {
        if (!loaded) setLoader(true);
      }, 400);

      setTimeoutFunc(timeout);

      if (localStorage.getItem("tab") !== null)
        setActivePanel(localStorage.getItem("tab"));
      if (
        localStorage.getItem("rating") !== null &&
        localStorage.getItem("rating").length !== 0
      ) {
        render(JSON.parse(localStorage.getItem("rating")), false, true);
        clearTimeout(timeout);
        setLoaded(true);
      } else {
        renderByFetch();
      }
    }
  }, [loaded, render, setLoader, updated, renderByFetch]);

  useEffect(() => {
    return () => {
      componentWillUnmount.current = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (componentWillUnmount.current) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);

  return (
    <Fragment>
      <PanelHeader separator={storage.isDesktop}>Популярные</PanelHeader>
      <PullToRefresh
        onRefresh={() => renderByFetch(true)}
        isFetching={fetching}
      >
        <Group>
          {loaded ? (
            <Fragment>
              <Div style={{ marginTop: -10, marginBottom: -20 }}>
                <ContentCard
                  disabled
                  header="Добро пожаловать на страницу рейтинга!"
                  caption="Здесь отображаются самые популярные аккаунты, которые отслеживают наши пользователи."
                />
              </Div>
              <SubnavigationBar>
                <SubnavigationButton
                  size="l"
                  style={{ width: "33%" }}
                  selected={activePanel === "youtube"}
                  onClick={() => {
                    localStorage.setItem("tab", "youtube");
                    setActivePanel("youtube");
                  }}
                >
                  YouTube
                </SubnavigationButton>

                <SubnavigationButton
                  size="l"
                  style={{ width: "33%" }}
                  selected={activePanel === "twitch"}
                  onClick={() => {
                    localStorage.setItem("tab", "twitch");
                    setActivePanel("twitch");
                  }}
                >
                  Twitch
                </SubnavigationButton>

                <SubnavigationButton
                  style={{ width: "33%" }}
                  selected={activePanel === "goodgame"}
                  size="l"
                  onClick={() => {
                    localStorage.setItem("tab", "goodgame");
                    setActivePanel("goodgame");
                  }}
                >
                  GoodGame
                </SubnavigationButton>
              </SubnavigationBar>
              {activePanel === "twitch" &&
                (twitch.length !== 0 ? (
                  twitch
                ) : (
                  <Placeholder
                    icon={<Icon56Stars3Outline />}
                    header="Никого нет!"
                  >
                    Как только кто-нибудь включит уведомления Twitch-стримера,
                    он отобразится здесь.
                  </Placeholder>
                ))}
              {activePanel === "youtube" &&
                (youtube.length !== 0 ? (
                  youtube
                ) : (
                  <Placeholder
                    icon={<Icon56Stars3Outline />}
                    header="Никого нет!"
                  >
                    Как только кто-нибудь включит уведомления от любого ютубера,
                    он отобразится здесь.
                  </Placeholder>
                ))}
              {activePanel === "goodgame" &&
                (goodgame.length !== 0 ? (
                  goodgame
                ) : (
                  <Placeholder
                    icon={<Icon56Stars3Outline />}
                    header="Никого нет!"
                  >
                    Как только кто-нибудь включит уведомления от любого
                    GoodGame-стримера, он отобразится здесь.
                  </Placeholder>
                ))}
            </Fragment>
          ) : (
            loader && <Spinner size="medium" />
          )}
        </Group>
      </PullToRefresh>
    </Fragment>
  );
}
