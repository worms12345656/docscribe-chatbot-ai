import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatLayout from "./ChatLayout";
import apiClient, { fileApiClient } from "@/js/core/ApiClient";
import { RESPONSE_STATUS_OK } from "@/js/Constant";
import { convertTimestamp, getToday } from "@/utils/datetime";
import { convertFileUpload, convertImageUpload } from "@/js/core/FileProcesser";
import { FormProvider, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { mockMessages } from "./const";
import { useIntersection } from "react-use";

const ChatApp = () => {
  const { user } = useSelector((state) => state.auth);
  const { oa } = useSelector((state) => state.oa);
  const [ws, setWs] = useState(null);
  const [customer, setCustomer] = useState();
  const [oaCustomers, setOaCustomers] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [haveNewMessageBox, setHaveNewMessageBox] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const { ref: lastMessageRef, inView: lastMessageVisibility } = useInView();
  const cacheMessages = new Set();
  const handleScrollToBottom = () => {
    if (bottomRef) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          // behavior: "smooth"
        });
      }, 1);
    }
  };

  const intersection = useIntersection(bottomRef, {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  });

  // const fetchOACustomerListData = async (isRendering = false) => {
  //   // const response = await apiClient.get(`/oas/customers/list-order-by-message?oaId=${oa?.id}`);
  //   // if (response.code === RESPONSE_STATUS_OK) {
  //   //   const oaCustomers = response.data.oaCustomers;
  //   //   setOaCustomers(oaCustomers);
  //   //   isRendering && setCustomer(oaCustomers[0]);
  //   // }
  //   const response = await apiClient.get(`/oas/customers/list?oaId=${oa?.id}`);
  //   if (response.code === RESPONSE_STATUS_OK) {
  //     const oaCustomers = response.data.oaCustomers;
  //     setOaCustomers(oaCustomers);
  //     isRendering && setCustomer(oaCustomers[0]);
  //   }
  // };

  const getMessageData = (message) => {
    const type =
      customer?.zaloOAUserId === message.zaloSenderId ? "receiver" : "oa_send";
    const sendTime = convertTimestamp(Number(message.timestamp));
    console.log(message.payload);
    if (message.event.includes("send_file")) {
      return {
        id: message.id,
        text: message.text,
        type,
        sendTime,
        image: {
          files: {
            name: message.attachments[0]?.payload.name,
            size: message.attachments[0]?.payload.size,
          },
          url: message.attachments[0]?.payload.url,
        },
        sending: false,
        error: "",
        reaction: message.reactions,
      };
    }
    if (message.event.includes("send_image")) {
      return {
        id: message.zaloOaMsgId,
        text: message.text,
        type,
        sendTime,
        image: message.attachments[0]?.payload.url,
        sending: false,
        error: "",
        reaction: message.reactions,
      };
    }
    if (message.event.includes("send_sticker")) {
      return {
        id: message.zaloOaMsgId,
        text: message.text,
        type,
        sendTime,
        sticker: message.attachments[0]?.payload.url,
        sending: false,
        error: "",
        reaction: message.reactions,
      };
    }
    if (message.event.includes("send_template")) {
      return {
        id: message.zaloOaMsgId,
        text: message.text,
        type,
        sendTime,
        image: "",
        attachments: message.attachments,
        payload: message.payload,
        sending: false,
        error: "",
        reaction: message.reactions,
      };
    }
    if (message.event.includes("send_list")) {
      return {
        id: message.zaloOaMsgId,
        text: message.text,
        type,
        sendTime,
        image: "",
        attachments: message.attachments,
        sending: false,
        error: "",
        reaction: message.reactions,
      };
    }
    return {
      id: message.zaloOaMsgId,
      text: message.text,
      type,
      sendTime,
      image: "",
      sending: false,
      error: "",
      reaction: message.reactions,
    };
  };

  const appendPage = (message) => {
    if (chatRef.current) {
      const previousHeight = chatRef.current.scrollHeight;
      const previousPosition = chatRef.current.scrollTop;

      setMessages((prev) => [
        ...message
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((item) => getMessageData(item)),
        ...prev,
      ]);

      setTimeout(() => {
        const newHeight = chatRef.current.scrollHeight;
        chatRef.current.scrollTop =
          newHeight - previousHeight + previousPosition;
      }, 0);
    }
  };

  const fetchCustomerMessageListData = async (page, add = false) => {
    if (add) {
      appendPage(mockMessages);
      return;
    }
    setMessages(
      mockMessages
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((item) => getMessageData(item))
    );
    setLoading(false);
    // const response = await apiClient.get(`/oas/messages/list?oaId=${oa?.id}&customerId=${customer?.zaloOAUserId}&limit=10&page=${page}`);
    // const response = await apiClient.get(`/oas/messages/list?oaId=${oa?.id}&customerId=8004980613029424672&limit=10&page=1`);
    // if (response.code === RESPONSE_STATUS_OK) {
    //   const messages = response.data.messages;
    //   setLoading(false);
    //   if (messages.length === 0) return;
    //   if (add) {
    //     appendPage(messages);
    //     setPage(page + 1);
    //     return;
    //   } else {
    //     setMessages(messages.sort((a, b) => a.timestamp - b.timestamp).map((item) => getMessageData(item)));
    //   }
    //   // console.log("messages", messages);
    // }
  };

  const methods = useForm();
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    // Connect to voice-enhanced WebSocket server
    const socket = new WebSocket("ws://localhost:8766");
    
    socket.onopen = () => {
      console.log("🎤 Connected to voice-enhanced WebSocket server");
    };

    socket.onmessage = (event) => {
      console.log("📨 Received from server:", event.data);
      
      try {
        // Try to parse as JSON for structured responses
        const data = JSON.parse(event.data);
        
        if (data.type === "response") {
          let messageText = data.response;
          
          // Add transcription info for voice responses
          if (data.input_type === "voice") {
            messageText = `🎤 [Voice Input] ${data.transcription}\n\n${data.response}`;
          }
          
          setMessages((prev) => [
            ...prev,
            {
              text: messageText,
              type: "server",
              sendTime: convertTimestamp(getToday()),
              isVoiceResponse: data.input_type === "voice",
            },
          ]);
        } else {
          // Handle plain text responses (backward compatibility)
          setMessages((prev) => [
            ...prev,
            {
              text: event.data,
              type: "server",
              sendTime: convertTimestamp(getToday()),
            },
          ]);
        }
      } catch (error) {
        // Handle plain text responses
        setMessages((prev) => [
          ...prev,
          {
            text: event.data,
            type: "server",
            sendTime: convertTimestamp(getToday()),
          },
        ]);
      }
      
      handleScrollToBottom();
    };

    socket.onclose = () => {
      console.log("🔌 Disconnected from WebSocket server");
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  // useEffect(() => {
  //   oa && fetchOACustomerListData(true);
  // }, [oa]);

  // useEffect(() => {
  //   oa && fetchOACustomerListData();
  // }, [oa]);

  const setReaction = async (index, emoji) => {
    const data = {
      oaId: oa?.id,
      customerId: customer?.zaloOAUserId,
      messageId: messages[index].id,
      reactIcon: emoji,
    };
    const response = await apiClient.post("/oas/messages/react-message", data);
    // if (response.code === RESPONSE_STATUS_OK) {
    //   if (emoji === "/-remove") {
    //     console.log("reaction", messages[index].reaction);
    //     return setMessages((prev) => {
    //       prev[index] = {
    //         ...prev[index],
    //         reaction: [...prev[index].reaction.filter((item) => item.sender_id === customer?.zaloOAUserId)]
    //       };
    //       return [...prev];
    //     });
    //   }
    //   setMessages((prev) => {
    //     prev[index] = {
    //       ...prev[index],
    //       reaction: [
    //         ...prev[index].reaction,
    //         {
    //           icon: emoji
    //         }
    //       ]
    //     };
    //     return [...prev];
    //   });
    // }
  };

  useEffect(() => {
    setLoading(true);
    customer && fetchCustomerMessageListData(1);
    setPage(2);
    handleScrollToBottom();
  }, [customer]);

  const onChangeCustomer = (customer) => {
    setCustomer(customer);
    reset();
  };

  const sendImagesMessage = async (input) => {
    const files = input.image;
    const formData = new FormData();
    formData.append("oaId", oa?.id);
    formData.append("customerId", customer?.zaloOAUserId);
    formData.append("message", input.message);
    if (files) {
      const thumbnailBlob = await convertImageUpload(files);
      formData.append("image", files);
    }
    setMessages((prev) => [
      ...prev,
      {
        text: input.message,
        type: "oa_send",
        sendTime: convertTimestamp(Date.now()),
        image: input.imagePreview,
        sending: true,
        error: "",
        reaction: [],
      },
    ]);
    reset();
    handleScrollToBottom();
    try {
      const response = await fileApiClient.post(
        "/oas/messages/send-message",
        formData
      );
      if (response.code === RESPONSE_STATUS_OK) {
        setMessages((prev) => [...prev.slice(0, -1)]);
        socketRef.current.emit("send_message", {
          oaId: oa?.id,
          customerId: customer?.zaloOAUserId,
          image: input.imagePreview,
          message: input.message,
          time: Date.now(),
        });
      } else {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            text: input.message,
            type: "oa_send",
            sendTime: convertTimestamp(Date.now()),
            image: input.imagePreview,
            sending: true,
            error: "Cannot send message",
            reaction: [],
          },
        ]);
        handleScrollToBottom();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const sendFilesMessage = async (input) => {
    const files = input.filePreview.files;

    const imagePreviewsArray = [];

    const formData = new FormData();
    formData.append("oaId", oa?.id);
    formData.append("customerId", customer?.zaloOAUserId);

    if (files) {
      const thumbnailBlob = await convertFileUpload(files);
      formData.append("file", files);

      setMessages((prev) => [
        ...prev,
        {
          text: "",
          type: "oa_send",
          sendTime: convertTimestamp(Date.now()),
          image: input.filePreview,
          sending: true,
          error: "",
          reaction: [],
        },
      ]);
      reset();
      handleScrollToBottom();
      try {
        const response = await fileApiClient.post(
          "/oas/messages/send-file-message",
          formData
        );
        if (response.code === RESPONSE_STATUS_OK) {
          setMessages((prev) => [...prev.slice(0, -1)]);
          socketRef.current.emit("send_message", {
            oaId: oa?.id,
            customerId: customer?.zaloOAUserId,
            image: input.filePreview,
            message: input.message,
            time: Date.now(),
            fileName: files.name,
            fileType: files.type,
          });
        } else {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              text: input.message,
              type: "oa_send",
              sendTime: convertTimestamp(Date.now()),
              image: input.filePreview,
              sending: true,
              error: "Cannot send message",
              reaction: [],
            },
          ]);
          handleScrollToBottom();
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  // const sendStickerMessage = async (input) => {
  //   const data = {
  //     oaId: oa?.id,
  //     customerId: customer?.zaloOAUserId,
  //     sticker: input.sticker
  //   };

  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       text: "",
  //       type: "oa_send",
  //       sendTime: convertTimestamp(Date.now()),
  //       image: input.sticker,
  //       sending: true,
  //       error: "",
  //       reaction: []
  //     }
  //   ]);
  //   reset();
  //   handleScrollToBottom();
  //   try {
  //     setMessages((prev) => [
  //       ...prev.slice(0, -1),
  //       {
  //         text: input.message,
  //         type: "oa_send",
  //         sendTime: convertTimestamp(Date.now()),
  //         image: input.sticker,
  //         sending: true,
  //         error: "Cannot send message",
  //         reaction: []
  //       }
  //     ]);
  //     handleScrollToBottom();
  //     // const response = await apiClient.post("/oas/messages/send-message", data);
  //     // if (response.code === RESPONSE_STATUS_OK) {
  //     //   setMessages((prev) => [...prev.slice(0, -1)]);
  //     //   socketRef.current.emit("send_message", {
  //     //     oaId: oa?.id,
  //     //     customerId: customer?.zaloOAUserId,
  //     //     image: input.sticker,
  //     //     message: input.message,
  //     //     time: Date.now()
  //     //   });
  //     // } else {
  //     //   setMessages((prev) => [
  //     //     ...prev.slice(0, -1),
  //     //     {
  //     //       text: input.message,
  //     //       type: "oa_send",
  //     //       sendTime: convertTimestamp(Date.now()),
  //     //       image: input.sticker,
  //     //       sending: true,
  //     //       error: "Cannot send message",
  //     //       reaction: []
  //     //     }
  //     //   ]);
  //     //   handleScrollToBottom();
  //     // }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // Handle voice messages
  const handleVoiceMessage = (audioData) => {
    if (!ws) {
      console.error("WebSocket not connected");
      return;
    }

    // Add voice message to chat
    const voiceMessage = {
      text: "🎤 Recording voice message...",
      type: "client",
      sendTime: convertTimestamp(Date.now()),
      isVoiceMessage: true,
      sending: true,
    };
    
    setMessages((prev) => [...prev, voiceMessage]);
    handleScrollToBottom();

    // Send voice data to server
    const message = {
      type: "voice",
      content: audioData,
    };

    try {
      ws.send(JSON.stringify(message));
      console.log("🎤 Voice message sent to server");
    } catch (error) {
      console.error("Error sending voice message:", error);
      
      // Update message with error
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...voiceMessage,
          text: "❌ Failed to send voice message",
          sending: false,
          error: true,
        },
      ]);
    }
  };

  const sendMessage = handleSubmit(async (input) => {
    if (input.image) {
      return await sendImagesMessage(input);
    }
    if (input.filePreview) {
      return await sendFilesMessage(input);
    }
    if (input.sticker) {
      return await sendStickerMessage(input);
    }
    if (!ws) return;
    
    const data = {
      oaId: oa?.id,
      customerId: customer?.zaloOAUserId,
      message: input.message,
      time: Date.now(),
    };
    
    const message = {
      text: data.message,
      type: "client",
      sendTime: convertTimestamp(data.time),
      image: data.image,
      sending: false,
    };

    // Send as structured message for voice-enhanced server
    const structuredMessage = {
      type: "text",
      content: input.message,
    };

    try {
      ws.send(JSON.stringify(structuredMessage));
      setMessages((prev) => [...prev, message]);
      reset();
      handleScrollToBottom();
    } catch (error) {
      console.error("Error sending text message:", error);
    }
  });

  const onChangeInput = (data) => {
    setMessage(data);
  };

  console.log("intersection", intersection?.intersectionRatio);

  useEffect(() => {
    const bottomInView = intersection?.intersectionRatio;
    bottomInView && setHaveNewMessageBox(false);
  }, [intersection?.intersectionRatio]);

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={sendMessage}>
          <ChatLayout
            lastMessageRef={lastMessageRef}
            sendMessage={sendMessage}
            customer={customer}
            message={message}
            messages={messages}
            onChangeInput={onChangeInput}
            bottomRef={bottomRef}
            oaCustomers={oaCustomers}
            onChangeCustomer={onChangeCustomer}
            sendImagesMessage={sendImagesMessage}
            sendFilesMessage={sendFilesMessage}
            chatRef={chatRef}
            setReaction={setReaction}
            handleScrollToBottom={handleScrollToBottom}
            haveNewMessageBox={haveNewMessageBox}
            onVoiceMessage={handleVoiceMessage}
            isConnected={!!ws}
          ></ChatLayout>
        </form>
      </FormProvider>
    </>
  );
};

export default ChatApp;
