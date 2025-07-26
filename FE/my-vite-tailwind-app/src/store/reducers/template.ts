import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  templates: []
};

const templates = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTemplates: (state, action) => {
      state.templates = action.payload;
    }
  }
});

export default templates.reducer;
export const { setTemplates } = templates.actions;
