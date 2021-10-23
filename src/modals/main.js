import React, { useEffect, useCallback, Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  ModalRoot,
  ModalCard,
  Avatar,
  Button,
} from "@vkontakte/vkui";

import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Icon24Dismiss,
  Icon56DonateOutline,
  Icon56GestureOutline,
  Icon56ServicesOutline,
  Icon56CheckCircleOutline,
  Icon56NewsfeedOutline,
  Icon56FireOutline,
  Icon56UserCircleOutline,
} from "@vkontakte/icons";

import {
  setActiveModal,
  setBackButton,
  setPopout,
  setSnackbar,
  setTour,
  setDontClone,
} from "../reducers/mainReducer";
import { setUpdatePage } from "../reducers/subscriptionsReducer";

import api from "../service/improvedFetch";

import Request from "./request";
import Twitch from "./twitch";
import YouTube from "./youtube";
import GoodGame from "./goodgame";
import ContentMakerServices from "./contentmakerservices";
import RandomSubscriber from "./randomsubscriber";
import Mailing from "./mailing";
import RefLink from "./reflink";
import SetLink from "./setlink";
import OWArcade from "./owarcade";
import KITEK from "./kitek";
import Steam from "./steam";
import NotificationsSettings from "./notificationsSettings";
import GoPaladins from "./gopaladins";

export default function Modals() {
  const [blockBackButton, setBlockBackButton] = useState(false);

  const storage = useSelector((state) => state.main);
  const dispatch = useDispatch();

  const history = useHistory();

  const [disabled, setDisabled] = useState(false);

  const pushToHistory = useCallback(
    (activeModal) => {
      history.push(window.location.pathname + "#" + activeModal);
    },
    [history]
  );

  const closeModal = useCallback(() => {
    if (!blockBackButton) {
      setBlockBackButton(true);
      history.goBack();
      dispatch(setDontClone(false));
      dispatch(setActiveModal(null));
      setTimeout(() => setBlockBackButton(false), 50);
    }
  }, [history, dispatch, blockBackButton]);

  useEffect(() => {
    if (storage.activeModal !== null && !storage.dontClone) {
      pushToHistory(storage.activeModal);
    }
  }, [pushToHistory, storage.activeModal, storage.dontClone]);

  return (
    <ModalRoot activeModal={storage.activeModal}>
      <ModalPage
        id="contentMakerRequest"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Новая заявка
          </ModalPageHeader>
        }
      >
        <Request closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="contentMakerServices"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Подписка
          </ModalPageHeader>
        }
      >
        <ContentMakerServices closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="notificationsSettings"
        onClose={() => {
          closeModal();
        }}
        settlingHeight={100}
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Уведомления
          </ModalPageHeader>
        }
      >
        <NotificationsSettings closeModal={closeModal} />
      </ModalPage>

      <ModalCard
        id="wallEvent"
        onClose={() => {
          closeModal();
        }}
        className="tw serviceCard"
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
        header={storage.modalData.header}
        subheader={
          storage.modalData.subheader +
          "\n\nДата публикации: " +
          storage.modalData.time
        }
      />

      <ModalCard
        id="remove"
        onClose={() => {
          closeModal();
        }}
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
            <Avatar mode="app" src={storage.modalData.img} size={56} />
          </motion.div>
        }
        header={storage.modalData.name}
        subheader={
          "Вы действительно хотите отключить уведомления от этого пользователя или сервиса?"
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            loading={disabled}
            disabled={disabled}
            onClick={() => {
              dispatch(setBackButton(true));
              setDisabled(true);
              api(
                "disableService",
                "id=" +
                  storage.modalData.service_id +
                  "&data=" +
                  storage.modalData.data
              ).then((data2) => {
                setDisabled(false);
                if (data2.response) {
                  setTimeout(() => closeModal(), 100);
                  dispatch(setUpdatePage(true));
                  setTimeout(() => dispatch(setUpdatePage(false)), 100);
                  dispatch(
                    setSnackbar({
                      text:
                        "Уведомления от «" +
                        storage.modalData.name +
                        "» отключены.",
                      success: true,
                    })
                  );
                } else if (data2.message === "already_deleted") {
                  dispatch(setUpdatePage(true));
                  setTimeout(() => dispatch(setUpdatePage(false)), 100);
                  dispatch(
                    setPopout({
                      title: "Еще раз?",
                      text: "Вы уже отключили уведомления от этого пользователя.",
                    })
                  );
                } else {
                  dispatch(
                    setPopout({
                      title: "Девочки, мы упали!",
                      text: "Что-то пошло не так... попробуйте позже или обратитесь в поддержку.",
                    })
                  );
                }
                dispatch(setBackButton(false));
              });
            }}
          >
            Да, отключить
          </Button>
        }
      />

      <ModalCard
        id="donut"
        onClose={() => {
          closeModal();
        }}
        className="tw"
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
            <Icon56DonateOutline />
          </motion.div>
        }
        header={"Подписка VK Donut"}
        subheader={
          "Пользователи без подписки могут подключить 3 сервиса одновременно, с подпиской - безлимитно. Помимо этого Вам откроются специальные сервисы, которые скрыты для обычных пользователей.\n\nКроме того, у Вас нет доступа к специальному чату для донов, где Вы можете подкинуть нам идею или просто пообщаться с разработчиком."
        }
        actions={
          <Fragment>
            <Button
              style={{ marginTop: -20 }}
              size="l"
              mode="primary"
              className="fixButton2"
              target="_blank"
              href="https://vk.com/donut/notificationsapp"
            >
              Оформить
            </Button>
          </Fragment>
        }
      />

      <ModalPage
        id="1"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Twitch
          </ModalPageHeader>
        }
      >
        <Twitch closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="2"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            YouTube
          </ModalPageHeader>
        }
      >
        <YouTube closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="4"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            GoodGame
          </ModalPageHeader>
        }
      >
        <GoodGame closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="5"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            OW Daily Arcade
          </ModalPageHeader>
        }
      >
        <OWArcade closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="6"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            КИТЭК
          </ModalPageHeader>
        }
      >
        <KITEK closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="7"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Steam
          </ModalPageHeader>
        }
      >
        <Steam closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="8"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Go-Paladins.ru
          </ModalPageHeader>
        }
      >
        <GoPaladins closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="randomSubscriber"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Рандомайзер
          </ModalPageHeader>
        }
      >
        <RandomSubscriber closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="startMailing"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Рассылка
          </ModalPageHeader>
        }
      >
        <Mailing closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="setLink"
        onClose={() => {
          closeModal();
        }}
        dynamicContentHeight
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Создание ссылки
          </ModalPageHeader>
        }
      >
        <SetLink closeModal={closeModal} />
      </ModalPage>

      <ModalPage
        id="refLink"
        dynamicContentHeight
        onClose={() => {
          closeModal();
        }}
        header={
          <ModalPageHeader
            right={
              storage.isDesktop ? (
                ""
              ) : (
                <PanelHeaderButton onClick={() => closeModal()}>
                  <Icon24Dismiss />
                </PanelHeaderButton>
              )
            }
            separator={false}
          >
            Просмотр ссылки
          </ModalPageHeader>
        }
      >
        <RefLink closeModal={closeModal} />
      </ModalPage>

      <ModalCard
        id="tour1"
        onClose={() => {
          closeModal();
        }}
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
            <Icon56GestureOutline />
          </motion.div>
        }
        header={"Добро пожаловать в «Уведомления»"}
        className="tw"
        subheader={
          "Сервис позволяет собрать все уведомления в одном месте.\n\nХотите получать уведомления от любимых стримеров на Twitch/YouTube/GoodGame? Легко!\n\nДля Вас мы подготовили небольшой тур, начнём? Прервать его можно в любой момент, закрыв модальное окно с заданием."
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(1));
              dispatch(
                setSnackbar({
                  text: "Перейдите на вкладку «Сервисы». Дальнейшие указания Вы получите там.",
                  success: true,
                })
              );
            }}
          >
            Начнём!
          </Button>
        }
      />

      <ModalCard
        id="tour2"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56ServicesOutline />
          </motion.div>
        }
        header={"Вкладка «Сервисы»"}
        className="tw"
        subheader={
          "Здесь отображаются все доступные на данный момент сервисы. Чтобы подключить сервис - нажмите на него. Попробуйте сделать это прямо сейчас, а затем перейдите на вкладку «Подписки»!"
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(2));
              dispatch(
                setSnackbar({
                  text: "Новое задание: подключить любой сервис, а после чего перейти на вкладку «Подписки».",
                  success: true,
                })
              );
            }}
          >
            Хорошо
          </Button>
        }
      />

      <ModalCard
        id="tour3"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56CheckCircleOutline />
          </motion.div>
        }
        header={"Задание выполнено!"}
        className="tw"
        subheader={
          "Вы успешно справились с заданием и подключили один или несколько сервисов. Однако сейчас мы не сможем оповещать Вас, например, через личные сообщения, если в них что-то произойдет. Давайте перейдем в настройки и исправим это?"
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(3));
              dispatch(
                setSnackbar({
                  text: "Новое задание: включить любой тип уведомлений.",
                  success: true,
                })
              );
            }}
          >
            Оки-доки!
          </Button>
        }
      />

      <ModalCard
        id="tour4"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56CheckCircleOutline />
          </motion.div>
        }
        header={"Задание выполнено!"}
        className="tw"
        subheader={
          "Вы успешно справились с заданием и включили уведомления. Кажется, пришло время ознакомить Вас с другими частями сервиса. Давайте перейдем, например, на вкладку «Лента»."
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(4));
              dispatch(
                setSnackbar({
                  text: "Новое задание: перейдите на вкладку «Лента».",
                  success: true,
                })
              );
            }}
          >
            Без проблем
          </Button>
        }
      />

      <ModalCard
        id="tour5"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56NewsfeedOutline />
          </motion.div>
        }
        header={"Вкладка «Лента»"}
        className="tw"
        subheader={
          "Здесь будет отображаться список из максимум 100 последних уведомлений. Если Вы захотите посмотреть, что было, допустим, позавчера, то можно сделать это здесь. Теперь давайте перейдем на вкладку «Популярные»."
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(5));
              dispatch(
                setSnackbar({
                  text: "Новое задание: перейдите на вкладку «Популярные».",
                  success: true,
                })
              );
            }}
          >
            Хорошо
          </Button>
        }
      />

      <ModalCard
        id="tour6"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56FireOutline />
          </motion.div>
        }
        header={"Вкладка «Популярные»"}
        className="tw"
        subheader={
          "На этой вкладке отображаются самые популярные каналы/аккаунты/блогеры, которых отслеживают через наш сервис. Если хотите поддержать любимого контент-мейкера - просто включите уведомления. Всё просто!\n\nПро подписки узнали, про работу сервиса узнали, а про профиль нет! Переходите на вкладку «Профиль», чтобы это исправить."
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(6));
              dispatch(
                setSnackbar({
                  text: "Новое задание: перейдите на вкладку «Профиль».",
                  success: true,
                })
              );
            }}
          >
            Ага, понятно
          </Button>
        }
      />

      <ModalCard
        id="tour7"
        onClose={() => {
          closeModal();
          dispatch(setTour(0));
        }}
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
            <Icon56UserCircleOutline />
          </motion.div>
        }
        header={"Вкладка «Профиль»"}
        className="tw"
        subheader={
          "Здесь на удивление отображается Ваш профиль и множество полезных функций. Многие из них скрыты, потому что у Вас отсутствует статус «Контент-мейкер». Если у Вас присутствует хотя бы 1000 подписчиков на одной из платформ - Вы можете получить этот статус и получить доступ к функциям. Однако для этого Вам необходимо подать заявку, нажав на специальную кнопку, расположенную в самом низу страницы.\n\nК сожалению, наш с Вами тур подошёл к концу. Спасибо за его прохождение, ещё увидимся!"
        }
        actions={
          <Button
            style={{ marginTop: -20 }}
            size="l"
            mode="primary"
            onClick={() => {
              closeModal();
              dispatch(setTour(0));
              dispatch(
                setSnackbar({
                  text: "Тур по сервису окончен! Спасибо за прохождение!",
                  success: true,
                })
              );
            }}
          >
            Завершить тур
          </Button>
        }
      />
    </ModalRoot>
  );
}
