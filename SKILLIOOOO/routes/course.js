import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import connectDB from "../config/db.js";
import { Note } from "../models/index.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ==============================
//  TEMP DIRECTORY
// ==============================
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// ==============================
// GEMINI SETUP
// ==============================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// ==============================
//  SAFE JSON PARSER
// ==============================
const safeParseJSON = (text) => {
  try {
    text = text.replace(/```json|```/g, "").trim();
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

// ==============================
//  YOUTUBE EMBED
// ==============================
app.post("/extract-video", (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    let videoId = "";

    if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v");
    } else if (url.includes("youtu.be")) {
      videoId = url.split("/").pop();
    }

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    res.json({
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    });

  } catch {
    res.status(500).json({ error: "Video processing failed" });
  }
});

// ==============================
//  GENERATE QUIZ 
// ==============================
app.post("/generate-quiz", async (req, res) => {
  try {
    const { lessonTitle } = req.body;

    if (!lessonTitle) {
      return res.status(400).json({ error: "lessonTitle required" });
    }

    let quiz = [];

    try {
      const result = await model.generateContent(`
Generate 5 MCQs for "${lessonTitle}" in JSON:
[
 {question:"", options:{A:"",B:"",C:"",D:""}, answer:"A"}
]
`);

      const text = result.response.text();
      console.log("AI RESPONSE:", text);

      quiz = safeParseJSON(text);

    } catch (aiErr) {
      console.log("AI FAILED:", aiErr.message);
    }

    // ALWAYS RETURN 
    if (!quiz) {
      quiz = [
        {
          question: "What is Java?",
          options: {
            A: "Programming Language",
            B: "Database",
            C: "OS",
            D: "Browser"
          },
          answer: "A"
        }
      ];
    }

    res.json({ quiz });

  } catch (err) {
    res.json({
      warning: "Fallback used",
      quiz: [
        {
          question: "Sample Question",
          options: {
            A: "Option A",
            B: "Option B",
            C: "Option C",
            D: "Option D"
          },
          answer: "A"
        }
      ]
    });
  }
});

// ==============================
//  SUBMIT QUIZ
// ==============================
app.post("/submit-quiz", async (req, res) => {
  try {
    const { answers, quiz, lessonTitle } = req.body;

    if (!answers || !quiz)
      return res.status(400).json({ error: "answers & quiz required" });

    let score = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    const percentage = (score / quiz.length) * 100;

    let difficulty =
      percentage < 50 ? "easy" : percentage > 80 ? "hard" : "medium";

    let nextLesson = "Next Topic";

    try {
      const next = await model.generateContent(
        `Suggest next topic after ${lessonTitle}`
      );
      nextLesson = next.response.text().trim();
    } catch {}

    res.json({
      score,
      percentage,
      difficulty,
      nextLesson,
      unlocked: percentage >= 50,
    });

  } catch {
    res.status(500).json({ error: "Quiz submission failed" });
  }
});

// ==============================
//  GENERATE NOTES
// ==============================
app.post("/generate-notes", async (req, res) => {
  try {
    const { lessonTitle } = req.body;

    if (!lessonTitle)
      return res.status(400).json({ error: "lessonTitle required" });

    const result = await model.generateContent(
      `Give short notes for ${lessonTitle}`
    );

    const notes = result.response.text();
    
    // Save to MongoDB
    await Note.create({ userId: req.body.userId || req.query.userId || "guest",  lessonTitle, notes });

    res.json({ notes });

  } catch {
    res.status(500).json({ error: "Notes generation failed" });
  }
});

// ==============================
//  GET NOTES
// ==============================
app.get("/notes", async (req, res) => {
  try {
    const notesStore = await Note.find({ userId: req.body.userId || req.query.userId || "guest" }).sort({ createdAt: -1 });
    res.json(notesStore);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// ==============================
//  GENERATE PDF
// ==============================
app.post("/generate-pdf", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic required" });

    const result = await model.generateContent(`Notes for ${topic}`);
    const notes = result.response.text();

    const filePath = path.join(tempDir, `notes_${Date.now()}.pdf`);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.text(notes);
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, () => fs.unlink(filePath, () => {}));
    });

  } catch {
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// ==============================
//  ANALYZE PDF
// ==============================
app.post("/analyze-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "PDF file required" });

    const buffer = fs.readFileSync(req.file.path);

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ");
    }

    // Truncate text to avoid token limits
    const truncated = text.slice(0, 8000);

    // Generate summary
    const summaryResult = await model.generateContent(
      `Summarize this document in 3-4 sentences:\n${truncated}`
    );
    const summary = summaryResult.response.text();

    // Generate 10 quiz questions
    const quizResult = await model.generateContent(`
Based on this document, generate exactly 10 multiple-choice quiz questions.
Respond ONLY with a valid JSON array (no markdown, no backticks):
[{"q":"question text","options":["option A","option B","option C","option D"],"answer":0}]
"answer" is the 0-indexed correct option.
Document: ${truncated}
`);
    const quizText = quizResult.response.text().replace(/```json|```/g, "").trim();
    let questions = [];
    try {
      const match = quizText.match(/\[[\s\S]*\]/);
      questions = match ? JSON.parse(match[0]) : [];
    } catch { questions = []; }

    fs.unlink(req.file.path, () => {});

    res.json({ summary, questions });

  } catch (err) {
    res.status(500).json({ error: "PDF analysis failed: " + err.message });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5005;

app.listen(PORT, () => {
  console.log(`🔥 SERVER RUNNING → http://localhost:${PORT}`);
});