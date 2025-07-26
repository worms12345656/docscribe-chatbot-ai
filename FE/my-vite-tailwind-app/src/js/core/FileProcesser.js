import Compressor from "compressorjs";

const convertFileUpload = (file) => {
  if (!file) {
    return;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

const convertImageUpload = (file) => {
  if (!file) {
    return;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * @desc compress image, return object  {
 *     error: 0 or 1,
 *     data: file compressed
 * }
 * @param file
 * @returns {File|Blob|*}
 */
const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.4,
      success(result) {
        resolve({
          error: 0,
          file: result
        });
      },
      error(err) {
        resolve({
          error: 1,
          file: file
        });
      }
    });
  });
};

const compressGif = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const gifData = event.target.result;

      const compressedGifBlob = new Blob([gifData], { type: "image/gif" });

      resolve({
        error: 0,
        file: compressedGifBlob
      });
    };

    reader.onerror = function (error) {
      resolve({
        error: 1,
        file: file
      });
    };

    reader.readAsArrayBuffer(file); // Read the GIF file as an ArrayBuffer
  });
};

const base64ToBlob = (base64, mime) => {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
};

const compressBase64Image = async (base64String) => {
  const mimeType = base64String.split(",")[0].match(/:(.*?);/)[1];
  const file = base64ToBlob(base64String, mimeType);

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.4,
      success(result) {
        resolve({
          error: 0,
          file: result
        });
      },
      error(err) {
        resolve({
          error: 1,
          file: file,
          message: err.message
        });
      }
    });
  });
};

export { convertFileUpload, convertBlobToBase64, compressImage, compressBase64Image, compressGif, convertImageUpload };
