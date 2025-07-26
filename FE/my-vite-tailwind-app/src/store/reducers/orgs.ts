import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orgs: [{ org: { id: -1 } }]
};

const orgs = createSlice({
  name: "orgs",
  initialState,
  reducers: {
    setOrgs: (state, action) => {
      state.orgs = action.payload;
    }
  }
});

export default orgs.reducer;
export const { setOrgs } = orgs.actions;
