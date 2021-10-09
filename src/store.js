import { configureStore } from "@reduxjs/toolkit";

// Импортим все редюсеры
import mainReducer from "./reducers/mainReducer";
import subscriptionsReducer from "./reducers/subscriptionsReducer";
import feedReducer from "./reducers/feedReducer";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    subscriptions: subscriptionsReducer,
    feed: feedReducer,
  },
});
