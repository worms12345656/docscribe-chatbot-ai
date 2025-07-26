import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myLoveVendors: [],
  contextView: {
    isPublic: false
  }
};

const vendor = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setMyLoveVendors: (state, action) => {
      const vendors = action.payload.myLoveVendors;
      state.myLoveVendors = vendors.filter((vendor) => vendor.preference === "loved");
    },
    setVendorView: (state, action) => {
      state.contextView = action.payload;
    }
  }
});

export default vendor.reducer;
export const { setMyLoveVendors, setVendorView } = vendor.actions;
