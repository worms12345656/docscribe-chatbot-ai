export const formatDateString = (date) => {
  try {
    if (!date) {
      return null;
    }
    const dateObject = new Date(Number(date));
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return null;
  }
};

export const convertDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

export const convertToDateTime = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getStartOfToday = () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return startOfToday.getTime();
};

export const getToday = () => {
  const now = new Date();
  return now.getTime();
};

export const getEndOfToday = () => {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return endOfToday.getTime();
};

export const getSevenDayFromToday = () => {
  const now = new Date();
  const SevenDayBefore = new Date(now);
  SevenDayBefore.setDate(now.getDate() - 7);
  return SevenDayBefore.getTime();
};

export const getAMonthFromToday = () => {
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return oneMonthAgo.getTime();
};

export const getThreeMonthFromToday = () => {
  const now = new Date();
  const threeMonthAgo = new Date(now);
  threeMonthAgo.setMonth(now.getMonth() - 3);
  return threeMonthAgo.getTime();
};
