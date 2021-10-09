import { createSlice } from "@reduxjs/toolkit";

export const feedReducer = createSlice({
  name: "feed",
  initialState: {
    data: null,
    loaded: false,
  },
  reducers: {
    saveData: (state, action) => {
      state.data = action.payload;
    },
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
  },
});

export const { saveData, setLoaded } = feedReducer.actions;

export default feedReducer.reducer;
