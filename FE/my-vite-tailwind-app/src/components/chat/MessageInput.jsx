// src/components/MessageInput.tsx
import React, { useRef, useState } from "react";
import { Box, TextField, IconButton, Tooltip, Stack, useTheme, Typography, OutlinedInput, Grid } from "@mui/material";
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
  UploadFile
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { convertFileSize } from "@/utils/convert";
import { SmileFilled } from "@ant-design/icons";
import { useClickAway } from "react-use";

const MessageInput = ({ sendMessage, onChangeInput, message, sendImagesMessage, sendFilesMessage }) => {
  // const [message, setMessage] = useState("");

  const { control, register, setValue, getValues, watch, setFocus } = useFormContext();

  const { t } = useTranslation();
  const theme = useTheme();
  const inputRef = useRef(null);
  const inputFileRef = useRef(null);
  const addStickerRef = useRef(null);
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
        url
      });
      setValue("imagePreview", "");
      setValue("image", "");
      setFocus("message");
      setValue("sticker", "");
      await sendMessage();
    }
  };

  const handleStickerChange = async (url) => {
    setValue("sticker", url);
    setValue("filePreview", "");
    setValue("imagePreview", "");
    setValue("image", "");
    setFocus("message");
    setAddSticker(false);
    await sendMessage();
  };

  // console.log("imagePreviews", imagePreviews);
  // console.log("files", files);

  return (
    <Stack
      direction={"column"}
      alignItems={"flex-start"}
      sx={{ display: "flex", pt: 1, borderTop: "1px solid #ddd", position: "relative" }}
    >
      <Stack direction={"row"} sx={{ pl: 14 }}>
        {watch("imagePreview") && (
          // watch("imagePreview").map((src, index) => (
          <Stack sx={{ position: "relative", bgcolor: "#ccc" }}>
            <img src={watch("imagePreview") || ""} alt={`Preview`} style={{ width: "50px", height: "50px", objectFit: "contain" }} />
            <IconButton
              sx={{
                position: "absolute",
                top: -15,
                left: "30px",

                ":hover": { backgroundColor: "transparent" }
              }}
              onClick={() => {
                setValue("imagePreview", "");
              }}
              type="button"
            >
              <Cancel sx={{ width: "20px", height: "20px", ":hover": { color: theme.palette.primary.main } }}></Cancel>
            </IconButton>
          </Stack>
        )}
        {/* ))} */}
        {/* {watch("filePreview") && (
          // watch("filePreview").map((item, index) => (
          <Stack
            direction={"row"}
            gap={1}
            alignItems={"center"}
            sx={{
              wordWrap: "break-word",
              cursor: "pointer",
              border: "1px solid #e6ebf1",
              borderRadius: "8px",
              p: 1,
              width: 120,
              height: 50,
              position: "relative"
            }}
            // onClick={() => onDowloadFile(watch("url"), watch("filePreview")?.name)}
          >
            <Description></Description>
            <Typography sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
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

                ":hover": { backgroundColor: "transparent" }
              }}
              onClick={() => {
                setValue("filePreview", "");
                setValue("url", "");
              }}
              type="button"
            >
              <Cancel sx={{ width: "20px", height: "20px", ":hover": { color: theme.palette.primary.main } }}></Cancel>
            </IconButton>
          </Stack>
        )} */}
        {/* ))} */}
      </Stack>

      <Stack
        ref={addStickerRef}
        sx={{
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          width: 340,
          height: 420,
          bottom: 50,
          left: 0,
          border: "1px solid #e6ebf1",
          borderRadius: "18px",
          p: 1,
          backgroundColor: "#fff",
          display: addSticker ? "block" : "none",
          zIndex: 10,
          cursor: "pointer"
        }}
      >
        <Typography sx={{ pb: 1 }}>{t("Sticker")}</Typography>
        <OutlinedInput
          sx={{ width: "100%", borderRadius: "50px", height: 24, lineHeight: 12, mb: 1 }}
          value={stickerFilter}
          placeholder={t("Sticker find")}
          startAdornment={<Search sx={{ width: 14, height: 14 }} />}
          endAdornment={stickerFilter && <Cancel sx={{ cursor: "pointer" }} onClick={() => setStickerFilter("")} />}
          onChange={(e) => {
            setStickerFilter(e.target.value);
          }}
        />
        <Grid container sx={{ overflow: "auto", height: 329 }}>
          {Array.from(Array(100), () => ({
            url: "https://zalo-api.zadn.vn/api/emoticon/sticker/webpc?eid=46986&size=130"
          })).map((item, index) => (
            <Grid item xs={3} onClick={() => handleStickerChange(item.url)}>
              <img src={item?.url} alt={`Sticker ${index + 1}`} style={{ width: "100%", objectFit: "contain" }} />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack direction={"row"} alignItems={"center"} sx={{ width: "100%", py: 1 }}>
        <Tooltip title={t("Upload Image")} sx={{ p: 0 }}>
          <IconButton onClick={inputImages} type="button">
            <InsertPhoto></InsertPhoto>
            <input
              type="file"
              value={""}
              style={{ display: "none" }}
              accept={".jpg,.png,.jfjf,.jpeg"}
              ref={inputRef}
              onChange={handleImagesChange}
            ></input>
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Upload File")} sx={{ p: 0 }}>
          <IconButton onClick={inputFiles} type="button">
            <AttachFile></AttachFile>
            <input type="file" value={""} style={{ display: "none" }} ref={inputFileRef} onChange={handleFilesChange}></input>
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Sticker")} sx={{ p: 0 }}>
          <IconButton onClick={() => setAddSticker(!addSticker)} type="button">
            <SentimentSatisfiedAlt></SentimentSatisfiedAlt>
          </IconButton>
        </Tooltip>
        <TextField {...register("message")} fullWidth variant="outlined" placeholder={t("Type a message...")} />
        <IconButton color="primary" type="submit">
          <SendIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default MessageInput;
