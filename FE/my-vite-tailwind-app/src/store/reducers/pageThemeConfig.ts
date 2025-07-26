import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false
};

const pageThemeConfig = createSlice({
  name: "pageThemeConfig",
  initialState,
  reducers: {
    openPageThemeConfigDrawer: (state, action) => {
      state.isOpen = action.payload.isOpen;
    }
  }
});

export default pageThemeConfig.reducer;
export const { openPageThemeConfigDrawer } = pageThemeConfig.actions;
