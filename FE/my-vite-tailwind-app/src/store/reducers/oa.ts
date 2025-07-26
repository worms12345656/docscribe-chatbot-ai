import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  oa: null
};

const oa = createSlice({
  name: "oa",
  initialState,
  reducers: {
    setOA: (state, action) => {
      state.oa = action.payload;
    }
  }
});

export default oa.reducer;
export const { setOA } = oa.actions;
