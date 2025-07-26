import { createSlice } from "@reduxjs/toolkit";
import { deleteCookie, setCookie } from "../../js/core/Cookie";

const initialState = {
  user: null,
  orgRole: null
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    register: (_: any, action) => {
      const token = action.payload.accessToken;
      setCookie("token", token);
    },
    login: (_, action) => {
      const token = action.payload.accessToken;
      setCookie("token", token);
    },
    saveUserInfo: (state, action) => {
      state.user = action.payload.userInfo;
    },
    saveOrgRole: (state, action) => {
      state.orgRole = action.payload;
    },
    logout: (state) => {
      deleteCookie("token");
      state.user = null;
    }
  }
});

export default auth.reducer;
export const { register, login, saveUserInfo, logout, saveOrgRole } = auth.actions;
