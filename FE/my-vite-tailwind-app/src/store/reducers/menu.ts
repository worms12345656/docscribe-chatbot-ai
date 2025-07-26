// types
import { createSlice } from "@reduxjs/toolkit";

// initial state
const initialState = {
  openItem: [],
  defaultId: "dashboard",
  openComponent: "buttons",
  drawerOpen: false,
  isDefaultDrawer: true,
  componentDrawerOpen: true
};

// ==============================|| SLICE - MENU ||============================== //

const menu = createSlice({
  name: "menu",
  initialState,
  reducers: {
    activeItem(state, action) {
      state.openItem = action.payload.openItem;
    },

    activeComponent(state, action) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawer(state, action) {
      state.drawerOpen = action.payload.drawerOpen;
    },

    selectDefaultDrawer(state, action) {
      state.isDefaultDrawer = action.payload.selectDefaultDrawer;
    },

    openComponentDrawer(state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    }
  }
});

export default menu.reducer;

export const { activeItem, activeComponent, openDrawer, selectDefaultDrawer, openComponentDrawer } = menu.actions;
