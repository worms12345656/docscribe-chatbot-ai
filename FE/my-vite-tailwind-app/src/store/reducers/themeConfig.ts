import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  config: {
    color: "#f5222d",
    mode: "light",
    language: "vi"
  }
};

const themeConfig = createSlice({
  name: "themeConfig",
  initialState,
  reducers: {
    openThemeConfigDrawer: (state, action) => {
      state.isOpen = action.payload.isOpen;
    },
    setThemeColor: (state, action) => {
      state.config.color = action.payload.mainColor;
    },
    setThemeLanguage: (state, action) => {
      let language = "vi";
      if (action.payload.language) {
        console.log(action.payload.language);
        language = action.payload.language;
      }

      console.log(language);
      state.config.language = language;
    }
  }
});

export default themeConfig.reducer;
export const { openThemeConfigDrawer, setThemeColor, setThemeLanguage } = themeConfig.actions;
