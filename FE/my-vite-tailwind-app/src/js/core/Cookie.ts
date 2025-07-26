/**
 * @desc set Cookie in a valid days (default 7 days)
 * @param key
 * @param value
 * @param days
 */
export const setCookie = (key: any, value: any, days?: any) => {
  if (!days) {
    days = 7;
  }

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = key + "=" + value + ";" + expires + ";path=/";
};

/**
 * @desc get valid cookie of a specific key
 * @param key
 */
export const getCookie = (key: any) => {
  const cookieStr = decodeURIComponent(document.cookie);
  const cookies = cookieStr.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(key + "=")) {
      return cookie.substring(key.length + 1);
    }
  }
  return null;
};

/**
 * @desc delete a cookie by key
 * @param key
 */
export const deleteCookie = (key: any) => {
  document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
