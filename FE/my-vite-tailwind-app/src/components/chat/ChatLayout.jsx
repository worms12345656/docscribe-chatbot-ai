import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getSocketDomain } from "@/js/core/Domain";
import { getCookie } from "@/js/core/Cookie";
import { Box, Drawer, IconButton } from "@mui/material";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

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
}) => {
  const { user } = useSelector((state) => state.auth);
  const { oa } = useSelector((state) => state.oa);
  const [customerId, setCustomerId] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  //   const [message, setMessage] = useState("");
  //   const [messages, setMessages] = useState([]);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
    console.log("customer", customer);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vh",
        height: "calc(100vh - 128px)",
        border: "1px solid #e6ebf1",
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
        }}
      >
        <ChatWindow
          lastMessageRef={lastMessageRef}
          messages={messages}
          bottomRef={bottomRef}
          customer={customer}
          toggleRightSidebar={toggleRightSidebar}
          isRightSidebarOpen={isRightSidebarOpen}
          chatRef={chatRef}
          setReaction={setReaction}
          handleScrollToBottom={handleScrollToBottom}
          haveNewMessageBox={haveNewMessageBox}
        />
        <MessageInput
          sendMessage={sendMessage}
          message={message}
          onChangeInput={onChangeInput}
          sendImagesMessage={sendImagesMessage}
          sendFilesMessage={sendFilesMessage}
        />
      </Box>

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
