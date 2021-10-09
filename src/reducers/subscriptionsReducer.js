import { createSlice } from "@reduxjs/toolkit";

export const subscriptionsReducer = createSlice({
  name: "subscriptions",
  initialState: {
    updatePage: false,
  },
  reducers: {
    setUpdatePage: (state, action) => {
      state.updatePage = action.payload;
    },
  },
});

export const { setUpdatePage } = subscriptionsReducer.actions;

export default subscriptionsReducer.reducer;
