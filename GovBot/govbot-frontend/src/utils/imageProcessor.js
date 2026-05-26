// Module 2 — Image Preprocessor
// Cleans up phone photos before OCR for better accuracy
// Runs entirely in browser using Canvas API — no server needed

/**
 * Preprocess an image file for OCR
 * - Converts to grayscale
 * - Increases contrast
 * - Sharpens edges
 * - Resizes to optimal OCR dimensions
 * @param {File} file - image file from input or camera
 * @returns {Promise<string>} base64 data URL of processed image
 */
export const preprocessImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Resize to optimal OCR width (1200px max)
        const maxW = 1200;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Step 1: Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
        }

        // Step 2: Increase contrast (stretch histogram)
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < min) min = data[i];
          if (data[i] > max) max = data[i];
        }
        const range = max - min || 1;
        for (let i = 0; i < data.length; i += 4) {
          const stretched = Math.round(((data[i] - min) / range) * 255);
          data[i] = data[i + 1] = data[i + 2] = stretched;
        }

        // Step 3: Adaptive thresholding — makes text crisp black on white
        const w = canvas.width;
        const h = canvas.height;
        const blockSize = 15;
        const output = new Uint8ClampedArray(data.length);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            // Calculate local average in block
            let sum = 0, count = 0;
            for (let by = Math.max(0, y - blockSize); by < Math.min(h, y + blockSize); by++) {
              for (let bx = Math.max(0, x - blockSize); bx < Math.min(w, x + blockSize); bx++) {
                sum += data[(by * w + bx) * 4];
                count++;
              }
            }
            const avg = sum / count;
            const idx = (y * w + x) * 4;
            const val = data[idx] < avg - 10 ? 0 : 255;
            output[idx] = output[idx + 1] = output[idx + 2] = val;
            output[idx + 3] = 255;
          }
        }

        const finalData = new ImageData(output, canvas.width, canvas.height);
        ctx.putImageData(finalData, 0, 0);

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        URL.revokeObjectURL(url);
        // If preprocessing fails, return original
        resolve(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
};

/**
 * Quick preview — resize only, no processing
 * Used for showing thumbnail in UI
 */
export const createThumbnail = (file, maxSize = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
};
