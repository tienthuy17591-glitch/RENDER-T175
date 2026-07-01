import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parser with a generous limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to parse data URLs or fetch HTTP/HTTPS URLs and return mimeType & base64 data
async function ensureBase64(imageInput: string) {
  if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    try {
      const response = await fetch(imageInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageInput}`);
      }
      const buffer = await response.arrayBuffer();
      const mimeType = response.headers.get("content-type") || "image/png";
      const base64 = Buffer.from(buffer).toString("base64");
      return {
        mimeType,
        data: base64
      };
    } catch (fetchErr: any) {
      console.error("Error fetching image from URL:", imageInput, fetchErr);
      return null;
    }
  }
  
  const matches = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

// Instantiate GoogleGenAI client lazily or safely
const getGeminiClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu khóa GEMINI_API_KEY. Vui lòng cấu hình khóa API trong mục 'Liên kết Gemini API Key' ở bảng điều khiển bên dưới hoặc liên hệ quản trị viên.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
};

// --- Real Rendering API Endpoint ---
app.post("/api/render", async (req, res) => {
  try {
    const { 
      sketch, 
      reference, 
      prompt, 
      aspectRatio, 
      quality,
      apiKey
    } = req.body;

    if (!sketch) {
      return res.status(400).json({ error: "Yêu cầu cung cấp ảnh phác thảo (sketch)" });
    }

    const sketchParsed = await ensureBase64(sketch);
    if (!sketchParsed) {
      return res.status(400).json({ error: "Định dạng ảnh phác thảo hoặc URL ảnh không hợp lệ" });
    }

    const ai = getGeminiClient(apiKey);

    // Map quality options to Gemini imageSize (512px, 1K, 2K, 4K)
    let imageSize: "512px" | "1K" | "2K" | "4K" = "1K";
    if (quality === "360p" || quality === "720p") {
      imageSize = "512px";
    } else if (quality === "1080p") {
      imageSize = "1K";
    } else if (quality === "2k") {
      imageSize = "2K";
    } else if (quality === "4k" || quality === "8k" || quality === "16k") {
      imageSize = "4K";
    }

    // Map aspect ratios to supported options: "1:1", "3:4", "4:3", "9:16", "16:9", etc.
    let finalAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
    if (aspectRatio === "16:9") finalAspectRatio = "16:9";
    else if (aspectRatio === "4:3") finalAspectRatio = "4:3";
    else if (aspectRatio === "9:16") finalAspectRatio = "9:16";

    const parts: any[] = [];

    // 1. Add sketch image
    parts.push({
      inlineData: {
        data: sketchParsed.data,
        mimeType: sketchParsed.mimeType
      }
    });

    // 2. Add style reference image if present
    if (reference) {
      const refParsed = await ensureBase64(reference);
      if (refParsed) {
        parts.push({
          inlineData: {
            data: refParsed.data,
            mimeType: refParsed.mimeType
          }
        });
      }
    }

    // 3. Add descriptive text prompt
    parts.push({
      text: prompt || "A luxurious, ultra-sharp realistic architectural photograph rendering based on this sketch."
    });

    console.log("Sending generate content request to gemini-3.1-flash-image with prompt:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: finalAspectRatio,
          imageSize: imageSize
        }
      }
    });

    // Extract the generated image from response
    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      console.error("No image part found in Gemini response parts:", response);
      const responseText = response.text || "";
      if (responseText) {
        return res.status(500).json({ 
          error: "Gemini returned a text response instead of an image. Ensure your prompt requests image rendering.", 
          details: responseText 
        });
      }
      return res.status(500).json({ error: "Không tìm thấy ảnh kết quả từ phản hồi của Gemini" });
    }

    return res.json({ imageUrl: base64Image });

  } catch (err: any) {
    console.error("Error in /api/render:", err);
    return res.status(500).json({ 
      error: err.message || "Đã xảy ra lỗi không xác định trong quá trình render", 
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined 
    });
  }
});

// --- Real Inpainting (Chỉnh sửa ảnh) API Endpoint ---
app.post("/api/inpaint", async (req, res) => {
  try {
    const { 
      image, 
      mask, 
      prompt,
      aspectRatio,
      quality,
      apiKey
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Yêu cầu cung cấp ảnh gốc để chỉnh sửa" });
    }
    if (!prompt) {
      return res.status(400).json({ error: "Yêu cầu cung cấp nội dung mô tả thay đổi" });
    }

    const baseParsed = await ensureBase64(image);
    if (!baseParsed) {
      return res.status(400).json({ error: "Ảnh gốc không hợp lệ" });
    }

    const ai = getGeminiClient(apiKey);

    let imageSize: "512px" | "1K" | "2K" | "4K" = "1K";
    if (quality === "360p" || quality === "720p") {
      imageSize = "512px";
    } else if (quality === "1080p") {
      imageSize = "1K";
    } else if (quality === "2k") {
      imageSize = "2K";
    } else if (quality === "4k" || quality === "8k" || quality === "16k") {
      imageSize = "4K";
    }

    let finalAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
    if (aspectRatio === "16:9") finalAspectRatio = "16:9";
    else if (aspectRatio === "4:3") finalAspectRatio = "4:3";
    else if (aspectRatio === "9:16") finalAspectRatio = "9:16";

    const parts: any[] = [];

    // 1. Add base render image
    parts.push({
      inlineData: {
        data: baseParsed.data,
        mimeType: baseParsed.mimeType
      }
    });

    // 2. Add mask overlay if provided (mask drawing canvas)
    if (mask) {
      const maskParsed = await ensureBase64(mask);
      if (maskParsed) {
        parts.push({
          inlineData: {
            data: maskParsed.data,
            mimeType: maskParsed.mimeType
          }
        });
      }
    }

    // 3. Request edit
    const systemPrompt = `We are doing an architectural rendering edit (inpainting) on the provided image.
The user has highlighted an area to change (indicated by the mask/brush drawing if present).
Please edit the highlighted area of the image to implement: "${prompt}".
Keep all other areas of the image unchanged to maintain structural integrity. Do not alter background, perspective or overall style, only substitute/add elements in the requested zone.`;

    parts.push({
      text: systemPrompt
    });

    console.log("Sending inpaint edit request to gemini-3.1-flash-image with prompt:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: finalAspectRatio,
          imageSize: imageSize
        }
      }
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!base64Image) {
      const responseText = response.text || "";
      if (responseText) {
        return res.status(500).json({ 
          error: "Gemini returned a text response instead of an edited image. Check prompt constraints.", 
          details: responseText 
        });
      }
      return res.status(500).json({ error: "Không thể lấy kết quả ảnh chỉnh sửa từ Gemini" });
    }

    return res.json({ imageUrl: base64Image });

  } catch (err: any) {
    console.error("Error in /api/inpaint:", err);
    return res.status(500).json({ 
      error: err.message || "Đã xảy ra lỗi không xác định trong quá trình chỉnh sửa ảnh", 
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined 
    });
  }
});


// --- Setup Vite Middleware (for development) and Static Server (for production) ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log("Starting server in PRODUCTION mode serving static build folder...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Server running on http://localhost:${PORT}`);
  });
}

start();
