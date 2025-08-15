// src/components/MessageInput.tsx
import React, { useRef, useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Typography,
  OutlinedInput,
  Grid,
  TextareaAutosize,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import {
  AttachFile,
  Cancel,
  Description,
  InsertDriveFile,
  InsertPhoto,
  Search,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  UploadFile,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { convertFileSize } from "@/utils/convert";
import { SmileFilled } from "@ant-design/icons";
import { useClickAway } from "react-use";

const MessageInput = ({
  sendMessage,
  onChangeInput,
  message,
  sendImagesMessage,
  sendFilesMessage,
}) => {
  // const [message, setMessage] = useState("");

  const { control, register, setValue, getValues, watch, setFocus } =
    useFormContext();

  const { t } = useTranslation();
  const theme = useTheme();
  const inputRef = useRef(null);
  const inputFileRef = useRef(null);
  const addStickerRef = useRef(null);
  const textRef = useRef(null);
  const [files, setFiles] = useState();
  const [stickerFilter, setStickerFilter] = useState();
  const [addSticker, setAddSticker] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  useClickAway(addStickerRef, () => {
    setAddSticker(false);
  });

  const inputImages = () => {
    if (inputRef) {
      inputRef.current?.click();
    }
  };

  const inputFiles = () => {
    if (inputFileRef) {
      inputFileRef.current?.click();
    }
  };

  // const handleKeyDown = async (e) => {
  //   if (e.key === "Enter" && message !== "") {
  //     e.preventDefault();
  //     await sendMessage();
  //   }
  // };

  const handleImagesChange = (event) => {
    const files = event.target.files[0];

    if (files) {
      const url = URL.createObjectURL(files);
      const reader = new FileReader();
      // reader.onload = (e) => {
      //   // imagePreviewsArray.push(e.target.result);
      //   // if (imagePreviewsArray.length === images.length) {
      //   //   setValue("imagePreview", imagePreviewsArray);
      //   //   setValue("filePreview", "");
      //   // }
      //   // console.log("result", reader.result);

      // };
      setValue("imagePreview", url);
      setValue("image", files);
      setValue("filePreview", "");
      setValue("url", "");
      setValue("sticker", "");
      setFocus("message");
      reader.readAsDataURL(files);

      // dùng cho nhiều image
      // setFiles((prev) => (Array.isArray(prev) ? [...prev, ...files] : [...files]));
      // sendImagesMessage(files);
      // const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
      // const imagePreviewsArray = [];

      // images.forEach((image) => {
      //   const reader = new FileReader();
      //   reader.onload = (e) => {
      //     // imagePreviewsArray.push(e.target.result);
      //     // if (imagePreviewsArray.length === images.length) {
      //     //   setValue("imagePreview", imagePreviewsArray);
      //     //   setValue("filePreview", "");
      //     // }
      //     setValue("imagePreview", e.target.result);
      //   };
      //   reader.readAsDataURL(image);
      // });
    }
  };

  const handleFilesChange = async (event) => {
    const files = event.target.files[0];

    if (files) {
      const url = URL.createObjectURL(files);
      setValue("filePreview", {
        files: files,
        url,
      });
      setValue("imagePreview", "");
      setValue("image", "");
      setFocus("message");
      setValue("sticker", "");
      await sendMessage();
    }
  };

  const handleTextChange = async (event) => {
    setValue("message", event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  // console.log("imagePreviews", imagePreviews);
  // console.log("files", files);

  return (
    <Stack
      direction={"column"}
      alignItems={"flex-start"}
      sx={{
        display: "flex",
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: "20px",
      }}
      e
    >
      <Stack direction={"row"} sx={{}}>
        {/* {watch("imagePreview") && (
          // watch("imagePreview").map((src, index) => (
          <Stack sx={{ position: "relative", bgcolor: "#ccc" }}>
            <img
              src={watch("imagePreview") || ""}
              alt={`Preview`}
              style={{ width: "50px", height: "50px", objectFit: "contain" }}
            />
            <IconButton
              sx={{
                position: "absolute",
                top: -15,
                left: "30px",

                ":hover": { backgroundColor: "transparent" },
              }}
              onClick={() => {
                setValue("imagePreview", "");
              }}
              type="button"
            >
              <Cancel
                sx={{
                  width: "20px",
                  height: "20px",
                  ":hover": { color: theme.palette.primary.main },
                }}
              ></Cancel>
            </IconButton>
          </Stack>
        )} */}
        {/* ))} */}
        {watch("filePreview") && (
          // watch("filePreview").map((item, index) => (
          <Stack
            direction={"row"}
            gap={1}
            alignItems={"center"}
            justifyContent={"flex-start"}
            sx={{
              wordWrap: "break-word",
              cursor: "pointer",
              border: "1px solid #e6ebf1",
              borderRadius: "8px",
              ml: "16px",
              mt: "16px",
              p: 1,
              width: "fit-content",
              maxWidth: 120,
              height: 50,
              position: "relative",
            }}
            // onClick={() => onDowloadFile(watch("url"), watch("filePreview")?.name)}
          >
            <Description></Description>
            <Typography
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {watch("filePreview")?.files.name}
              <br />
              <Typography component={"span"} sx={{ fontSize: "12px" }}>
                {convertFileSize(watch("filePreview")?.files.size)}
              </Typography>
            </Typography>
            <IconButton
              sx={{
                position: "absolute",
                top: -15,
                left: "100px",

                ":hover": { backgroundColor: "transparent" },
              }}
              onClick={() => {
                setValue("filePreview", "");
                setValue("url", "");
              }}
              type="button"
            >
              <Cancel
                sx={{
                  width: "20px",
                  height: "20px",
                  ":hover": { color: theme.palette.primary.main },
                }}
              ></Cancel>
            </IconButton>
          </Stack>
        )}
        {/* ))} */}
      </Stack>

      <Stack
        direction={"row"}
        alignItems={"flex-end"}
        sx={{
          width: "100%",
        }}
      >
        {/* <input
          type="file"
          value={""}
          style={{ display: "none" }}
          accept={".pdf,.txt,.docs"}
          ref={inputRef}
          onChange={handleImagesChange}
        ></input> */}
        {/* <input
          type="file"
          value={""}
          style={{ display: "none" }}
          ref={inputFileRef}
          onChange={handleFilesChange}
        ></input> */}

        <textarea
          {...register("message")}
          onChange={handleTextChange}
          rows={1}
          className=" w-full p-4 pl-[24px] focus:outline-0  resize-none"
          placeholder={t("Ask me about document...")}
        />
        <IconButton sx={{ padding: "16px" }} color="primary" type="submit">
          <SendIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default MessageInput;
