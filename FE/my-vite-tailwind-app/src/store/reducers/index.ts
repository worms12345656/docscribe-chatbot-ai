// third-party
import { combineReducers } from "redux";
// project import
import auth from "./auth";
import menu from "./menu";
import pageThemeConfig from "./pageThemeConfig";
import themeConfig from "./themeConfig";
import vendor from "./vendor";
import oa from "./oa";
import templates from "./template";
import orgs from "./orgs";

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menu,
  auth,
  themeConfig,
  pageThemeConfig,
  vendor,
  oa,
  templates,
  orgs
});

export default reducers;
