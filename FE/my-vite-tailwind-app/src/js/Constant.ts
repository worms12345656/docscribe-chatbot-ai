const RESPONSE_STATUS_OK = 200;
const RESPONSE_STATUS_ERROR = 400;
const SERVER_ERROR_MESSAGE =
  "The system is temporarily disrupted. We are working to fix it as quickly as possible. Please try again later.";
const ROLE_ADMIN = "admin";
const ROLE_MEMBER = "member";
const ROLE_DESIGNER = "designer";
// const ROLE_PLANNER = "planner";

const STANDARD_DESKTOP_WIDTH = 1920;
const STANDARD_TABLET_WIDTH = 1280;
const STANDARD_MOBILE_WIDTH = 414;
const SHAPE_HEART_RATIO_SIZE = 260 / 235;

const INVITE_FORM_HEIGHT = 480;
const NAVBAR_ELEMENT_HEIGHT = 40;
const NAVBAR_ELEMENT_WIDTH = 700;
const MESSENGER_LINK = "http://m.me/letscelebratevn";
const GUEST_RESPONSE_HEIGHT = 500;

const DARK_THEME_CONFIG = {
  background: {
    default: "#121212",
    paper: "#1F1B24"
  },
  divider: "#ffffff1f",
  text: {
    primary: "#fff",
    secondary: "#ffffffb3",
    disabled: "#ffffff80"
  }
};

const TOTAL_FREE_CREDITS = 250;

const GOOGLE_MAP_API_KEY = "AIzaSyCq1WmG5O6WVoW3Ovpm3wEMniiUP88vZac";
const DONUT_CHART_COLOR = ["#554994", "#F675AB", "#F29393", "#A7D2CB", "#F2D388", "#C98474", "#874C62", "#85586F", "#C4DFAA", "#90CBAC"];
const COVER_IMAGE_URL = "https://khan-web-prod.s3.ap-southeast-1.amazonaws.com/uploads/cover-compress.jpeg";

const SUBSCRIPTION_ERROR_CODE = 1000;

export {
  RESPONSE_STATUS_ERROR,
  RESPONSE_STATUS_OK,
  SERVER_ERROR_MESSAGE,
  ROLE_ADMIN,
  ROLE_MEMBER,
  STANDARD_MOBILE_WIDTH,
  STANDARD_TABLET_WIDTH,
  STANDARD_DESKTOP_WIDTH,
  DARK_THEME_CONFIG,
  INVITE_FORM_HEIGHT,
  GUEST_RESPONSE_HEIGHT,
  SHAPE_HEART_RATIO_SIZE,
  MESSENGER_LINK,
  GOOGLE_MAP_API_KEY,
  DONUT_CHART_COLOR,
  COVER_IMAGE_URL,
  TOTAL_FREE_CREDITS,
  SUBSCRIPTION_ERROR_CODE,
  NAVBAR_ELEMENT_HEIGHT,
  ROLE_DESIGNER,
  NAVBAR_ELEMENT_WIDTH
};
