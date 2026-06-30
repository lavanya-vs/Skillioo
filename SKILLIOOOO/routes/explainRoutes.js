import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { CodeExplanation } from "../models/index.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
//  GEMINI SETUP
// ==============================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// ==============================
//  EXPLAIN CODE API
// ==============================
app.post("/api/explain", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const prompt = `
You are a programming code execution visualizer.

Analyze the following ${language} code step-by-step.

Return ONLY valid JSON in this exact format:
{
  "steps": [
    {
      "lineNumber": 1,
      "line": "code line",
      "explanation": "what happens",
      "variables": {}
    }
  ],
  "finalOutput": "output"
}

Rules:
- Follow execution order
- Show variable updates after each step
- Keep explanation simple
- ONLY JSON (no extra text)

CODE:
${code}
`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();

    // Clean response
    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: text
      });
    }

    // Save to MongoDB
    await CodeExplanation.create({ userId: req.body.userId || req.query.userId || "guest", 
      code,
      language,
      steps: data.steps,
      finalOutput: data.finalOutput
    });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==============================
// HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("Code Explainer API running 🚀");
});

// ==============================
// 🚀 START SERVER (PORT 5007)
// ==============================
const PORT = 5007;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

