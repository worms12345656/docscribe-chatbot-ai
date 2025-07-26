export const linkify = (text) => {
  try {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.split(urlPattern).map((part, index) => {
      if (urlPattern.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: messageClass === "sent" ? "#fff" : "#000",
              textDecoration: "underline"
            }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  } catch {
    return text;
  }
};
