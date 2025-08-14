// src/components/ChatWindow.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  FormHelperText,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import {
  HighlightOff,
  SentimentSatisfiedAlt,
  Warning,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useClickAway } from "react-use";
import { reactionIcon } from "./const";

export const StyledBubble = styled("div")(({ theme }) => ({
  border: "1px solid #e6ebf1",
  borderRadius: "18px",
  lineHeight: "19px",
  fontSize: "15px",
}));

export const StyledStack = styled(Stack)(({ theme }) => ({
  ":hover .timeStamp": {
    display: "block",
  },
}));

const ChatBubble = ({
  type = "receiver",
  children,
  sendTime,
  haveImage = false,
  sending = false,
  error = "",
  isTemplate = false,
  isHTML = false,
  reaction,
  index,
  width = "fit-content",
  setReaction,
  handleScrollToBottom,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [timeStamp, setTimeStamp] = useState(false);
  const [addReaction, setAddReaction] = useState(false);
  const fullText = children.props ? children.props.children : children;
  const [messages, setMessages] = useState("");
  const [messagesIndex, setMessagesIndex] = useState(0);
  const timeoutRef = useRef(null);
  const addReactionRef = useRef(null);
  const buttonReactionRef = useRef(null);
  const haveReaction = reaction && reaction?.length > 0;
  const maxReaction = reaction && reaction?.length < 7;

  const onShowTimeStamp = () => {
    timeoutRef.current = setTimeout(() => {
      setTimeStamp(true);
    }, 500);
  };

  const onRemoveTimeStamp = () => {
    clearTimeout(timeoutRef.current);
    setTimeStamp(false);
  };

  useClickAway(addReactionRef, () => {
    setAddReaction(false);
  });

  const onChooseEmoji = async (e) => {
    setAddReaction(false);
    await setReaction(index, e.target.value);
  };

  const onRemoveEmoji = async () => {
    await setReaction(index, "/-remove");
    setAddReaction(false);
  };
  useEffect(() => {
    if (type === "server" && messagesIndex < fullText.length) {
      setTimeout(() => {
        setMessages((prev) => prev + fullText[messagesIndex]);
        setMessagesIndex(messagesIndex + 1);
        handleScrollToBottom();
      }, 20);
    }
    return () => clearTimeout();
  }, [messagesIndex, fullText]);

  return (
    <StyledStack alignItems={type === "client" && "flex-end"} width={"100%"}>
      <Stack
        direction={"row"}
        sx={{
          gap: 1,
          opacity: sending ? 0.3 : 1,
          pointerEvents: sending && "none",
          position: "relative",
          paddingBottom: haveReaction && 1,
          width: "fit-content",
        }}
        alignItems={"flex-end"}
        justifyContent={type === "client" && "flex-end"}
      >
        <StyledStack
          direction={type !== "client" ? "row" : "row-reverse"}
          alignItems={"center"}
          gap={1}
        >
          <StyledBubble
            sx={{
              position: "relative",
              backgroundColor:
                type === "client"
                  ? haveImage
                    ? "transparent"
                    : isTemplate
                    ? "transparent"
                    : theme.palette.primary.main
                  : "none",
              border: type !== "client" && "none",
              color:
                type === "client" ? (isTemplate ? "none" : "#fff") : "none",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              padding: haveImage || isTemplate ? 0 : "8px 12px",
              overflow: "hidden",
              width: type === "client" ? "fit-content" : "100%",
              whiteSpace: "pre-wrap",
              textAlign: "start",
            }}
          >
            {type === "server" ? messages.slice(1) : children}
          </StyledBubble>
          {/* <Box sx={{ position: "relative", height: 40, width: 112 }}>
            {timeStamp && (
              <StyledBubble
                sx={{
                  color: "#262626",
                  backgroundColor: "#e6ebf1",
                  fontSize: "12px",
                  textWrap: "nowrap",
                  padding: "4px 8px",
                  position: "absolute",
                  top: 5,
                  right: 0,
                  zIndex: 2,
                }}
              >
                {sendTime}
              </StyledBubble>
            )}
          </Box> */}
        </StyledStack>
      </Stack>
      {error && (
        <>
          <FormHelperText
            sx={{
              ml: "35px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            error
          >
            <Warning sx={{ width: 15, height: 13 }}></Warning>
            {t(error)}
          </FormHelperText>
        </>
      )}
    </StyledStack>
  );
};

export default ChatBubble;
