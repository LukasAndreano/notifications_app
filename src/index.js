import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import "core-js/features/map";
import "core-js/features/set";
import api from "./service/improvedFetch";

// Подключаем необходимые зависимости
import { ConfigProvider, AdaptivityProvider, AppRoot } from "@vkontakte/vkui";
import { Provider } from "react-redux";
import { store } from "./store";
import queryString from "query-string";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import { BrowserRouter as Router } from "react-router-dom";

// Подключаем все нужные стили для работы сервиса
import "@vkontakte/vkui/dist/vkui.css";
import "./css/style.css";

// Импортируем главный файл
import App from "./App";
import Cookies from "./panels/Cookies";

bridge.send("VKWebAppInit");

try {
  localStorage.setItem("test", "test");
  localStorage.clear();

  const getParams = queryString.parse(window.location.search);

  if (
    getParams.vk_platform !== undefined &&
    getParams.vk_is_favorite !== undefined
  ) {
    sessionStorage.setItem("platform", `${getParams.vk_platform}`);
    sessionStorage.setItem("params", window.location.search);
    sessionStorage.setItem("favorites", `${getParams.vk_is_favorite}`);
  }

  bridge.subscribe(({ detail: { type, data } }) => {
    if (type === "VKWebAppUpdateConfig") {
      const schemeAttribute = document.createAttribute("scheme");
      schemeAttribute.value = data.scheme ? data.scheme : "client_light";
      document.body.attributes.setNamedItem(schemeAttribute);
    }
  });

  // Начинаем рендер, где подключаем Storage и ConfigProviver (необходим для определения платформы и нормальной работой с VKMA)
  api("init").then((data) => {
    if (data.response) {
      ReactDOM.render(
        <Provider store={store}>
          <ConfigProvider isWebView={true} scheme="inherit">
            <AdaptivityProvider>
              <AppRoot>
                <Router>
                  <App />
                </Router>
              </AppRoot>
            </AdaptivityProvider>
          </ConfigProvider>
        </Provider>,
        document.getElementById("root")
      );
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <ConfigProvider isWebView={true}>
            Неверная подпись параметров запуска
          </ConfigProvider>
        </Provider>,
        document.getElementById("root")
      );
    }
  });
} catch {
  ReactDOM.render(
    <Provider store={store}>
      <ConfigProvider isWebView={true}>
        <Cookies />
      </ConfigProvider>
    </Provider>,
    document.getElementById("root")
  );
}

// Подключаем Service Worker, который необходим для PWA-приложений
serviceWorkerRegistration.register();
