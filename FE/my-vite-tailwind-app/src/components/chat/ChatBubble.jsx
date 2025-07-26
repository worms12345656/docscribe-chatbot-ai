// src/components/ChatWindow.tsx
import React, { useRef, useState } from "react";
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

const Reaction = ({
  reaction,
  haveReaction,
  reactionIcons,
  addReaction,
  setAddReaction,
  addReactionRef,
  type,
  onChooseEmoji,
  t,
  onRemoveEmoji,
}) => {
  return (
    <>
      {haveReaction && (
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            right: type === "oa_send" && 0,
            left: type !== "oa_send" && 36,
            textAlign: "center",
            border: "1px solid #e6ebf1",
            borderRadius: "24px",
            backgroundColor: "#fff",
            cursor: "pointer",
            px: 1,
            pb: "1px",
          }}
          onClick={() => setAddReaction(true)}
        >
          {[...new Set(sortByFrequencyDesc(reactionIcons))].map(
            (reaction) =>
              reactionIcon.find((item) => item.value === reaction).label
          )}
          {reaction.length}
        </Box>
      )}
      {!haveReaction && (
        <Box
          className="timeStamp"
          sx={{
            position: "absolute",
            bottom: -8,
            right: type === "oa_send" && 0,
            left: type !== "oa_send" && 36,
            width: "24px",
            height: "24px",
            textAlign: "center",
            border: "1px solid #e6ebf1",
            borderRadius: "99%",
            backgroundColor: "#fff",
            display: addReaction ? "block" : "none",
            cursor: "pointer",
            pt: "2px",
          }}
          onClick={() => setAddReaction(true)}
        >
          <SentimentSatisfiedAlt
            sx={{ width: "18px", height: "18px", cursor: "pointer" }}
          ></SentimentSatisfiedAlt>
        </Box>
      )}
      <StyledBubble
        ref={addReactionRef}
        sx={{
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          bottom: 16,
          right: type === "oa_send" && 0,
          left: type !== "oa_send" && 36,
          backgroundColor: "#fff",
          display: addReaction ? "block" : "none",
          zIndex: 10,
          cursor: "pointer",
        }}
      >
        {reactionIcon.map((item, index) => (
          <IconButton
            onClick={onChooseEmoji}
            key={`reaction_${index}`}
            value={item.value}
            sx={{
              ":hover": { backgroundColor: "transparent" },
              color: "#ccc",
              p: "1px",
              cursor: "pointer",
            }}
          >
            {item.label}
          </IconButton>
        ))}
        {haveReaction && (
          <Tooltip title={t("Delete Emoji")}>
            <IconButton
              onClick={onRemoveEmoji}
              sx={{
                ":hover": { backgroundColor: "transparent" },
                color: "#ccc",
                p: "1px",
                cursor: "pointer",
              }}
            >
              <HighlightOff></HighlightOff>
            </IconButton>
          </Tooltip>
        )}
      </StyledBubble>
    </>
  );
};

const ChatBubble = ({
  type = "receiver",
  children,
  sendTime,
  avatar,
  haveImage = false,
  sending = false,
  error = "",
  isTemplate = false,
  isHTML = false,
  reaction,
  index,
  width = "fit-content",
  setReaction,
  noReaction = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [timeStamp, setTimeStamp] = useState(false);
  const [addReaction, setAddReaction] = useState(false);
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

  const reactionIcons = reaction.map((item) => item.icon);

  const displayReaction = new Set(reaction);

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

  return (
    <StyledStack alignItems={type === "oa_send" && "flex-end"} width={"100%"}>
      <Stack
        direction={"row"}
        sx={{
          gap: 1,
          opacity: sending ? 0.3 : 1,
          pointerEvents: sending && "none",
          maxWidth: 350,
          position: "relative",
          paddingBottom: haveReaction && 1,
        }}
        alignItems={"flex-end"}
        justifyContent={type === "oa_send" && "flex-end"}
        width={"100%"}
      >
        {type !== "oa_send" && (
          <Avatar
            className="user-avatar"
            src={avatar || ""}
            sx={{
              width: "28px",
              height: "28px",
            }}
            alt="Avatar"
          ></Avatar>
        )}
        <StyledStack
          direction={type !== "oa_send" ? "row" : "row-reverse"}
          alignItems={"center"}
          gap={1}
        >
          <StyledBubble
            sx={{
              position: "relative",
              backgroundColor:
                type === "oa_send"
                  ? haveImage
                    ? "transparent"
                    : isTemplate
                    ? "transparent"
                    : theme.palette.primary.main
                  : "none",
              border: haveImage && "none",
              color:
                type === "oa_send" ? (isTemplate ? "none" : "#fff") : "none",
              wordWrap: "break-word",
              maxWidth: 350,
              overflowWrap: "break-word",
              padding: haveImage || isTemplate ? 0 : "8px 12px",
              overflow: "hidden",
              width: isHTML ? "350px" : "fit-content",
            }}
            onMouseEnter={onShowTimeStamp}
            onMouseLeave={onRemoveTimeStamp}
          >
            {children}
          </StyledBubble>
          {!noReaction && (
            <Reaction
              addReaction={addReaction}
              addReactionRef={addReactionRef}
              haveReaction={haveReaction}
              reaction={reaction}
              reactionIcons={reactionIcons}
              setAddReaction={setAddReaction}
              type={type}
              onChooseEmoji={onChooseEmoji}
              t={t}
              onRemoveEmoji={onRemoveEmoji}
            ></Reaction>
          )}
          <Box sx={{ position: "relative", height: 40 }}>
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
          </Box>
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
