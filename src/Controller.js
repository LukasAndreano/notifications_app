import React from "react";

import { Switch, Route } from "react-router-dom";

// Импортируем все панели
import Profile from "./panels/Profile";
import Feed from "./panels/Feed";
import Services from "./panels/Services";
import Subscriptions from "./panels/Subscriptions";
import Rating from "./panels/Rating";

const routes = [
  {
    path: "/subscriptions",
    exact: true,
    panel: () => <Subscriptions />,
  },
  {
    path: "/profile",
    exact: true,
    panel: () => <Profile />,
  },
  {
    path: "/services",
    exact: true,
    panel: () => <Services />,
  },
  {
    path: "/rating",
    exact: true,
    panel: () => <Rating />,
  },
  {
    path: "/",
    panel: () => <Feed />,
  },
];

export default function Controller() {
  return (
    <Switch>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          children={<route.panel />}
        />
      ))}
    </Switch>
  );
}
