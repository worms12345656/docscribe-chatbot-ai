// src/components/ChatWindow.tsx
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ChatBubble from "./ChatBubble";
import {
  AddShoppingCart,
  ChevronRight,
  Description,
  Expand,
  KeyboardDoubleArrowDown,
} from "@mui/icons-material";
import { convertFileSize } from "@/utils/convert";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const EmbeddedHtmlFile = ({ link_url, theme }) => {
  const { t } = useTranslation();

  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    const fetchHtmlFile = async () => {
      try {
        const response = await fetch(link_url);
        if (!response.ok) {
          throw new Error("Failed to fetch HTML file");
        }
        const htmlText = await response.text();
        setHtmlContent(htmlText);
      } catch (error) {
        console.error("Error fetching HTML file:", error);
      }
    };
    link_url && fetchHtmlFile();
  }, [link_url]);

  return (
    <Box
      sx={{
        width: "100%",
        padding: "0px",
        overflow: "hidden",
        // backgroundColor: theme.palette.primary.main
      }}
    >
      {htmlContent ? (
        <Box
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          sx={{
            padding: "10px",
          }}
        />
      ) : (
        <Typography>{t("Loading")}...</Typography>
      )}
    </Box>
  );
};

const ChatWindow = ({
  messages,
  bottomRef,
  customer,
  toggleRightSidebar,
  isRightSidebarOpen,
  lastMessageRef,
  chatRef,
  handleScrollToBottom,
  setReaction,
  haveNewMessageBox,
}) => {
  const theme = useTheme();
  const onDowloadFile = (url, name) => {
    // console.log("url", url);
    const filePath = url;
    const a = document.createElement("a");
    // a.id="_downloadFile"
    a.href = filePath;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = name;
    // a.children = "Download here";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // navigate(url);
  };

  const getDataFromElement = (data) => {
    if (!data) return;
    if (data.type === "banner") {
      return (
        <img
          src={data.thumbnail}
          alt={`thumnail attachment`}
          style={{
            width: "350px",
            height: "150px",
            objectFit: "fill",
            borderBottom: "1px solid #e6ebf1",
          }}
        />
      );
    }
    if (data.type === "header") {
      return (
        <Typography sx={{ textAlign: data.align, fontWeight: 500, p: 1 }}>
          {data.content}
        </Typography>
      );
    }

    if (data.type === "text") {
      return data?.content
        .split("<br>")
        .map((text) => (
          <Typography sx={{ textAlign: data.align, fontSize: "12px", px: 1 }}>
            {text}
          </Typography>
        ));
    }
    if (data.type === "table") {
      return (
        <table style={{ padding: "8px" }}>
          {data?.content.map((row) => (
            <tr>
              <td style={{ fontSize: "12px" }}>{row.key}</td>
              <td style={{ fontSize: "12px" }}>{row.value}</td>
            </tr>
          ))}
        </table>
      );
    }
  };

  const getButtonFromElement = (data) => {
    return (
      <IconButton sx={{ width: "100%", borderTop: "1px solid #e6ebf1" }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          sx={{ width: "100%" }}
        >
          {/* <img
            src={data?.thumbnail}
            // alt={`thumnail attachment`}
            style={{
              width: "36px"
            }}
          /> */}
          <AddShoppingCart></AddShoppingCart>
          <Typography>{data.title}</Typography>
          <ChevronRight></ChevronRight>
        </Stack>
      </IconButton>
    );
  };

  return (
    <>
      <Stack
        direction={"row"}
        sx={{ borderBottom: "1px solid  #e6ebf1", px: 2, py: "18px", gap: 1 }}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack direction={"row"} sx={{ gap: 1 }}>
          <Avatar
            className="user-avatar"
            src={customer ? customer.avatar : ""}
            style={{
              width: "46px",
              height: "46px",
            }}
            alt="Avatar"
          ></Avatar>
          <Stack direction={"column"} justifyContent={"flex-start"}>
            <Typography sx={{ fontWeight: "700", fontSize: 15 }}>
              {customer?.displayName}
            </Typography>
            {customer?.tags.map(
              (item, index) =>
                item.trim() && (
                  <Chip
                    sx={{ width: "fit-content", height: 25 }}
                    key={`tags_${index}`}
                    label={item}
                  ></Chip>
                )
            )}
          </Stack>
        </Stack>
        <IconButton
          onClick={toggleRightSidebar}
          sx={{ ":hover": { backgroundColor: "transparent" } }}
        >
          <Expand
            sx={{
              transform: "rotate(90deg)",
              color: isRightSidebarOpen && theme.palette.primary.main,
            }}
          ></Expand>
        </IconButton>
      </Stack>
      <Box
        sx={{
          position: "relative",
          flex: 1,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          p: 2,
        }}
        ref={chatRef}
      >
        <Box ref={lastMessageRef}></Box>
        <Stack sx={{ flex: 1, gap: 2, justifyContent: "flex-end" }}>
          {messages?.map((item, index) => {
            if (item?.payload?.link_url) {
              // console.log("item", item);
            }
            return (
              <>
                {item?.text && !item?.image && (
                  <ChatBubble
                    sending={item?.sending}
                    error={item?.error}
                    key={`message_${index}`}
                    sendTime={item?.sendTime}
                    type={item?.type}
                    avatar={customer ? customer.avatar : ""}
                    reaction={item?.reaction}
                    index={index}
                    setReaction={setReaction}
                  >
                    {/* <Stack
                  direction={"row"}
                  gap={1}
                  alignItems={"center"}
                  sx={{ wordWrap: "break-word", cursor: "pointer" }}
                  onClick={() => onDowloadFile(item?.url, item?.text.name)}
                >
                  <Description></Description>
                  <Typography sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {item?.text.name}
                    <br />
                    <Typography component={"span"} sx={{ fontSize: "12px" }}>
                      {convertFileSize(item?.text.size)}
                    </Typography>
                  </Typography>
                </Stack> */}
                    <Typography>{item?.text}</Typography>
                  </ChatBubble>
                )}
                {item?.text &&
                  item?.image &&
                  typeof item?.image !== "object" && (
                    <ChatBubble
                      isTemplate
                      sending={item?.sending}
                      error={item?.error}
                      key={`message_${index}`}
                      sendTime={item?.sendTime}
                      type={item?.type}
                      avatar={customer ? customer.avatar : ""}
                      reaction={item?.reaction}
                      index={index}
                      setReaction={setReaction}
                    >
                      {/* <Stack
                  direction={"row"}
                  gap={1}
                  alignItems={"center"}
                  sx={{ wordWrap: "break-word", cursor: "pointer" }}
                  onClick={() => onDowloadFile(item?.url, item?.text.name)}
                >
                  <Description></Description>
                  <Typography sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {item?.text.name}
                    <br />
                    <Typography component={"span"} sx={{ fontSize: "12px" }}>
                      {convertFileSize(item?.text.size)}
                    </Typography>
                  </Typography>
                </Stack> */}
                      <Typography
                        sx={{
                          p: 1,
                          backgroundColor:
                            item?.type === "oa_send"
                              ? theme.palette.primary.main
                              : "none",
                          color: "#fff",
                          minWidth: 350,
                        }}
                      >
                        {item?.text}
                      </Typography>
                      <Stack alignItems={"center"} sx={{ width: 350 }}>
                        <img
                          src={item?.image}
                          alt={`Preview ${index + 1}`}
                          style={{ width: "fit-content" }}
                        />
                      </Stack>
                    </ChatBubble>
                  )}
                {!item?.text &&
                  item?.image &&
                  typeof item?.image !== "object" && (
                    <ChatBubble
                      haveImage
                      sending={item?.sending}
                      error={item?.error}
                      key={`message_attach_${index}`}
                      sendTime={item?.sendTime}
                      type={item?.type}
                      avatar={customer ? customer.avatar : ""}
                      reaction={item?.reaction}
                      index={index}
                      setReaction={setReaction}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            item?.type === "oa_send" ? "end" : "start",
                        }}
                      >
                        <img
                          src={item?.image}
                          alt={`Preview ${index + 1}`}
                          style={{ maxWidth: 350, objectFit: "contain" }}
                        />
                      </Box>
                    </ChatBubble>
                  )}
                {!item?.text && item?.sticker && (
                  <ChatBubble
                    haveImage
                    sending={item?.sending}
                    error={item?.error}
                    key={`message_attach_${index}`}
                    sendTime={item?.sendTime}
                    type={item?.type}
                    avatar={customer ? customer.avatar : ""}
                    reaction={item?.reaction}
                    index={index}
                    setReaction={setReaction}
                    noReaction
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          item?.type === "oa_send" ? "end" : "start",
                      }}
                    >
                      <img
                        src={item?.sticker}
                        alt={`Preview ${index + 1}`}
                        style={{ maxWidth: 350, objectFit: "contain" }}
                      />
                    </Box>
                  </ChatBubble>
                )}
                {item?.image && typeof item?.image === "object" && (
                  <ChatBubble
                    sending={item?.sending}
                    error={item?.error}
                    key={`message_attach_${index}`}
                    sendTime={item?.sendTime}
                    type={item?.type}
                    avatar={customer ? customer.avatar : ""}
                    reaction={item?.reaction}
                    index={index}
                    setReaction={setReaction}
                  >
                    <Stack
                      direction={"row"}
                      gap={1}
                      alignItems={"center"}
                      sx={{ wordWrap: "break-word", cursor: "pointer" }}
                      onClick={() =>
                        onDowloadFile(item?.image?.url, item?.image.files.name)
                      }
                      index={index}
                    >
                      <Description></Description>
                      <Typography
                        sx={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item?.image?.files?.name}
                        <br />
                        <Typography
                          component={"span"}
                          sx={{ fontSize: "12px" }}
                        >
                          {convertFileSize(item?.image?.files?.size)}
                        </Typography>
                      </Typography>
                    </Stack>
                  </ChatBubble>
                )}
                {item.attachments &&
                  item.attachments.map((attachment, indexA) => {
                    if (attachment.type === "link") {
                      return (
                        <ChatBubble
                          isTemplate
                          sending={item?.sending}
                          error={item?.error}
                          key={`message_attach_${index}_${indexA}`}
                          sendTime={item?.sendTime}
                          type={item?.type}
                          avatar={customer ? customer.avatar : ""}
                          reaction={item?.reaction}
                          index={index}
                          setReaction={setReaction}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent:
                                item?.type === "oa_send" ? "end" : "start",
                              flex: 0,
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              sx={{
                                pt: 1,
                                px: 1,
                                fontWeight: 500,
                                fontSize: 16,
                              }}
                            >
                              {attachment?.payload.title}
                            </Typography>
                            <Typography sx={{ pb: 1, px: 1 }}>
                              {attachment?.payload.description}
                            </Typography>
                            <img
                              src={attachment?.payload?.thumbnail}
                              alt={`thumnail attachment ${indexA + 1}`}
                              style={{
                                width: "300px",
                                borderTop: "1px solid #e6ebf1",
                              }}
                            />
                          </Box>
                        </ChatBubble>
                      );
                    }
                  })}

                {/* I think we dont use this now, comment for later, use the payload instead */}
                {item.attachments &&
                  item.attachments.map((attachment, indexA) => {
                    if (
                      attachment.payload.template_type === "transaction_order"
                    ) {
                      return (
                        <ChatBubble
                          isTemplate
                          sending={item?.sending}
                          error={item?.error}
                          key={`message_attach_${index}`}
                          sendTime={item?.sendTime}
                          type={item?.type}
                          avatar={customer ? customer.avatar : ""}
                          reaction={item?.reaction}
                          index={index}
                          setReaction={setReaction}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent:
                                item?.type === "oa_send" ? "end" : "start",
                              flex: 0,
                              flexDirection: "column",
                            }}
                          >
                            {attachment.payload?.elements?.map((data) =>
                              getDataFromElement(data)
                            )}
                            <Box sx={{ pt: 1 }}>
                              {attachment.payload?.buttons?.map((data) =>
                                getButtonFromElement(data)
                              )}
                            </Box>
                          </Box>
                        </ChatBubble>
                      );
                    }
                  })}
                {item?.payload?.link_url && (
                  <ChatBubble
                    isTemplate
                    isHTML
                    sending={item?.sending}
                    error={item?.error}
                    key={`message_payload_${index}`}
                    sendTime={item?.sendTime}
                    type={item?.type}
                    avatar={customer ? customer.avatar : ""}
                    reaction={item?.reaction}
                    index={index}
                    setReaction={setReaction}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          item?.type === "oa_send" ? "end" : "start",
                        flex: 0,
                        flexDirection: "column",
                      }}
                    >
                      <EmbeddedHtmlFile
                        link_url={item?.payload?.link_url}
                        theme={theme}
                      />
                    </Box>
                  </ChatBubble>
                )}
              </>
            );
          })}
        </Stack>
        <Box ref={bottomRef}></Box>
        {haveNewMessageBox && (
          <Stack
            sx={{
              position: "sticky",
              bottom: -16,
              right: 0,
              alignItems: "flex-end",
            }}
          >
            <Stack
              direction={"row"}
              sx={{
                width: "fit-content",
                cursor: "default",
                border: "1px solid #e6ebf1",
                backgroundColor: "#fff",
                p: 1,
                borderRadius: "4px",
                gap: 1,
              }}
              onClick={handleScrollToBottom}
            >
              {t("New Message")}
              <KeyboardDoubleArrowDown></KeyboardDoubleArrowDown>
            </Stack>
          </Stack>
        )}
        {/* <a href="https://do38.dlfl.me/b67803423bf795a9cce6/3903487431241000877" target="_blank" rel="noopener noreferrer" download="System Design Interview An Insider’s Guide by Alex Xu (z-lib.org).pdf">Downloafd</a> */}
      </Box>
    </>
  );
};

export default ChatWindow;
