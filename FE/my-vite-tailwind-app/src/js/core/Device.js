/**
 * @desc check the current device is mobile or not
 */
export const isMobile = () => {
  return /Mobi|Android/i.test(window.navigator.userAgent);
};

export const isMacBook = () => {
  return /Macintosh/.test(navigator.userAgent) && /Mac OS X/.test(window.navigator.userAgent);
};
