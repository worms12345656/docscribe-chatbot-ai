import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getSocketDomain } from "@/js/core/Domain";
import { getCookie } from "@/js/core/Cookie";
import { Box, Drawer, IconButton, Stack } from "@mui/material";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import { useFormContext } from "react-hook-form";

const ChatApp = ({
  sendMessage,
  message,
  messages,
  onChangeInput,
  bottomRef,
  oaCustomers,
  onChangeCustomer,
  customer,
  sendImagesMessage,
  sendFilesMessage,
  lastMessageRef,
  handleScrollToBottom,
  chatRef,
  setReaction,
  haveNewMessageBox,
  isThinking,
}) => {
  const inputFileRef = useRef(null);
  const [isDragFile, setIsDragFile] = useState(false);
  //   const [message, setMessage] = useState("");
  //   const [messages, setMessages] = useState([]);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const { setValue } = useFormContext();

  useEffect(() => {
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("ưe");
      // const droppedFiles = Array.from(e.dataTransfer.files);
      const files = e.dataTransfer.files[0];
      const url = URL.createObjectURL(files);
      setValue("filePreview", {
        files,
        url,
      });
      setIsDragFile(false);
    };

    const handleDragEnter = (e) => {
      console.log("enter");
      e.preventDefault();
      e.stopPropagation();
      setIsDragFile(true);
    };

    const handleDragOver = (e) => {
      console.log("over");
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget === null) {
        setIsDragFile(false);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // const handleFilesChange = async (event) => {
  //   const files = event.target.files[0];
  //   console.log(files);
  //   if (files) {
  //     const url = URL.createObjectURL(files);
  //     setValue("filePreview", {
  //       files: files,
  //       url,
  //     });
  //     setFocus("message");
  //   }
  // };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        height: "calc(100vh - 66px)",
      }}
    >
      {/* Left Sidebar */}
      {/* <Sidebar oaCustomers={oaCustomers} onChangeCustomer={onChangeCustomer} customer={customer} /> */}

      {/* Main Chat Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          // flex: isRightSidebarOpen ? 1 : 1.5,
          transition: "flex 0.3s ease",
          mx: "32px",
        }}
      >
        <ChatWindow
          lastMessageRef={lastMessageRef}
          messages={messages}
          bottomRef={bottomRef}
          customer={customer}
          isRightSidebarOpen={isRightSidebarOpen}
          chatRef={chatRef}
          setReaction={setReaction}
          handleScrollToBottom={handleScrollToBottom}
          haveNewMessageBox={haveNewMessageBox}
          isThinking={isThinking}
        />
        <MessageInput
          sendMessage={sendMessage}
          message={message}
          onChangeInput={onChangeInput}
          sendImagesMessage={sendImagesMessage}
          sendFilesMessage={sendFilesMessage}
        />
      </Box>
      {isDragFile && (
        <Stack
          sx={{
            position: "absolute",
            width: "100%",
            height: "calc(100vh - 66px)",
            backgroundColor: "#f0f8ff",
          }}
          alignItems={"center"}
          justifyContent={"center"}
          onClick={() => inputFileRef.current.click()}
        >
          <input
            type="file"
            value={""}
            style={{ display: "none" }}
            accept={".pdf,.txt,.docs"}
            multiple
            ref={inputFileRef}
            // onChange={handleFilesChange}
          ></input>
          <p className="">Drag & drop files here, or click to upload</p>
        </Stack>
      )}

      {/* Right Sidebar */}
      {/* {isRightSidebarOpen && <RightSidebar customer={customer} />} */}
      {/* <Drawer></Drawer> */}
      {/* Toggle Button */}
      {/* <IconButton
        onClick={toggleRightSidebar}
        sx={{
          position: "absolute",
          top: 10,
          right: isRightSidebarOpen ? 310 : 10,
          backgroundColor: "white",
          zIndex: 10,
          border: "1px solid #ddd"
        }}
      >
        Hello
        {isRightSidebarOpen ? <CloseIcon /> : <SettingsIcon />}
      </IconButton> */}
    </Box>
  );
};

export default ChatApp;
