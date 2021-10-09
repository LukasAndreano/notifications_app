import { createSlice } from "@reduxjs/toolkit";

export const mainReducer = createSlice({
  name: "main",
  initialState: {
    isDesktop: false,
    url: "/",
    activeModal: null,
    user: null,
    navigation: true,
    updateURL: false,
    disableBackButton: false,
    updateSwitchers: false,
    group_notifications: 0,
    notifications: 0,
    time: {
      0: 0,
      1: 0,
    },
    tour: 0,
    popout: {
      title: null,
      text: null,
    },
    snackbar: {
      text: null,
      success: true,
    },
    dontClone: false,
    modalData: {
      img: null,
      header: null,
      contentMakerServices: null,
      subheader: null,
      service: null,
      time: null,
      service_id: null,
      name: null,
      channel: null,
      data: null,
    },
    tag: null,
  },
  reducers: {
    savePlatform: (state, action) => {
      state.isDesktop = action.payload;
    },
    saveURL: (state, action) => {
      state.url = action.payload;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    saveModalData: (state, action) => {
      state.modalData = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setBackButton: (state, action) => {
      state.disableBackButton = action.payload;
    },
    setPopout: (state, action) => {
      state.popout = { title: action.payload.title, text: action.payload.text };
    },
    setSnackbar: (state, action) => {
      state.snackbar = {
        text: action.payload.text,
        success: action.payload.success,
      };
    },
    setNavigation: (state, action) => {
      state.navigation = action.payload;
    },
    setUpdateURL: (state, action) => {
      state.updateURL = action.payload;
    },
    saveTag: (state, action) => {
      state.tag = action.payload;
    },
    updateNotifications: (state, action) => {
      if (action.payload.group_notifications !== undefined)
        state.group_notifications = action.payload.group_notifications;
      state.notifications = action.payload.notifications;
    },
    updateSwitchers: (state, action) => {
      state.updateSwitchers = action.payload;
    },
    setTime: (state, action) => {
      state.time[action.payload.time] = action.payload.value;
    },
    setTour: (state, action) => {
      state.tour = action.payload;
    },
    setDontClone: (state, action) => {
      state.dontClone = action.payload;
    },
  },
});

export const {
  savePlatform,
  saveURL,
  setActiveModal,
  setUser,
  saveModalData,
  setBackButton,
  setPopout,
  setSnackbar,
  setNavigation,
  setUpdateURL,
  setTime,
  saveTag,
  setDontClone,
  updateNotifications,
  updateSwitchers,
  setTour,
} = mainReducer.actions;

export default mainReducer.reducer;
