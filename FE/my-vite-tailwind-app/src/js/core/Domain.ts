export const getBackendDomain = () => {
  return import.meta.env.VITE_APP_BACKEND_DOMAIN;
};

export const getSocketDomain = () => {
  return import.meta.env.VITE_APP_BACKEND_WEBHOOK_DOMAIN;
};

export const getLandingpageUrl = () => {
  return import.meta.env.VITE_APP_LANDING_PAGE_URL;
};

export const getFrontendDomain = () => {
  return import.meta.env.VITE_APP_FRONTEND_DOMAIN;
};

export const checkGlobalDomain = () => {
  return false;
};
