import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"; //  STABLE PDF
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { Chat } from "../models/index.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

//  GEMINI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});


// TEXT CHAT 

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // Save user message to DB
    await Chat.create({ userId: req.body.userId || req.query.userId || "guest",  role: "user", text: message });

    // Fetch history from DB
    const historyDocs = await Chat.find({ userId: req.body.userId || req.query.userId || "guest",  sessionId: "default_session" }).sort({ createdAt: 1 });

    const result = await model.generateContent({
      contents: historyDocs.map(msg => ({
        role: msg.role === "ai" ? "model" : msg.role, // ensure correct role mapping
        parts: [{ text: msg.text }]
      }))
    });

    const reply = result.response.text();

    // Save AI response to DB
    await Chat.create({ userId: req.body.userId || req.query.userId || "guest",  role: "model", text: reply });

    // Fetch updated history
    const updatedHistory = await Chat.find({ userId: req.body.userId || req.query.userId || "guest",  sessionId: "default_session" }).sort({ createdAt: 1 });

    res.json({ reply, history: updatedHistory });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


//  GET HISTORY

app.get("/history", async (req, res) => {
  try {
    const history = await Chat.find({ userId: req.body.userId || req.query.userId || "guest",  sessionId: "default_session" }).sort({ createdAt: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


//  IMAGE CHAT

app.post("/chat-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: req.file.mimetype
              }
            },
            {
              text: "Explain this image clearly"
            }
          ]
        }
      ]
    });

    fs.unlinkSync(req.file.path);

    const text = result.response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error("IMAGE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


//  PDF CHAT 

app.post("/chat-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdf = await pdfjsLib.getDocument({
  data: new Uint8Array(dataBuffer)
}).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map(item => item.str);
      text += strings.join(" ") + "\n";
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Explain this document clearly:\n\n${text}`
            }
          ]
        }
      ]
    });

    fs.unlinkSync(req.file.path);

    res.json({ reply: result.response.text() });

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🚀 START SERVER

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🤖 Chatbot running on http://localhost:${PORT}`);
});