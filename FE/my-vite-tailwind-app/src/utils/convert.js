import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

// Extract number from string
export const convertStringToNumber = (str) => {
  const match = str.match(/\d+(\.\d+)?/);
  if (match) {
    return parseFloat(match[0]);
  }
  return null;
};

/**
 * extract translate x and y from css transform
 * @param str
 * @returns {{translateY: *, translateX: *}}
 */
export const extractTransformValue = (str) => {
  const translateRegex = /translate\(([-0-9.]+)px, ([-0-9.]+)px\)/;
  const rotateRegex = /rotate\(([-0-9.]+)deg\)/;
  const rotate = str.match(rotateRegex) ? str.match(rotateRegex)[1] : 0;
  const translateX = str.match(translateRegex) ? str.match(translateRegex)[1] : 0;
  const translateY = str.match(translateRegex) ? str.match(translateRegex)[2] : 0;
  return {
    translateX: translateX,
    translateY: translateY,
    rotate: rotate
  };
};

export const encodeBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const decodeBase64 = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

export const extractUrlsFromText = (text) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.match(urlRegex) || null;
};

export const noDataColumnChartOption = (t) => {
  return {
    legend: false,
    series: [
      {
        type: "column",
        name: "Random data",
        data: []
      }
    ],
    lang: {
      noData: t("No Information")
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030"
      }
    }
  };
};

export const noDataChartOption = () => {
  const { t } = useTranslation();
  return {
    series: [
      {
        type: "pie",
        name: "Random data",
        data: []
      }
    ],
    lang: {
      noData: t("No Information")
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#303030"
      }
    }
  };
};

export const convertAudioToFormattedText = (audioText) => {
  const sentences = audioText
    .toLowerCase()
    .split("_")
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence);

  const formattedText = sentences.map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1)).join(" ");

  return formattedText;
};

export const countUniqueTags = (data) => {
  const uniqueTags = new Set();

  data.forEach((item) => {
    const tags = item.tags || [];
    tags.forEach((tag) => {
      if (tag) uniqueTags.add(tag);
    });
  });

  return uniqueTags.size;
};

export const checkValue = (value) => {
  if (value === null || value === "UNDEFINED" || value === undefined) {
    return "Undefined";
  }
  return value;
};

export const convertFileSize = (bytes) => {
  const kilobytes = bytes / 1024;
  const megabytes = kilobytes / 1024;

  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`;
  } else {
    return `${kilobytes.toFixed(2)} KB`;
  }
};

export const sortByFrequencyDesc = (arr) => {
  const frequency = arr.reduce((count, num) => {
    count[num] = (count[num] || 0) + 1;
    return count;
  }, {});

  return arr.slice().sort((a, b) => {
    if (frequency[b] === frequency[a]) {
      return b - a;
    }
    return frequency[b] - frequency[a];
  });
};
