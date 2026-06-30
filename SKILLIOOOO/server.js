import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));




import express from "express";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// ==============================
// ✅ GEMINI CONFIG (REST API)
// ==============================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ==============================
// 🧠 GENERATE QUIZ
// ==============================
app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const prompt = `
Generate exactly 5 multiple choice questions on "${topic}"

Rules:
- 4 options (A, B, C, D)
- One correct answer
- Medium difficulty
- Return ONLY JSON array

Format:
[
  {
    "question": "text",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "answer": "A"
  }
]
`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("RAW:", text);

    // CLEAN RESPONSE
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);

    if (!match) {
      throw new Error("Invalid JSON from Gemini");
    }

    const quiz = JSON.parse(match[0]);

    res.json({ quiz });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 📊 SUBMIT QUIZ
// ==============================
app.post("/submit-quiz", async (req, res) => {
  try {
    const { answers, quiz, topic } = req.body;

    let score = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    const percentage = (score / quiz.length) * 100;

    const prompt = `
User scored ${percentage}% in "${topic}".

Suggest next topic:
- <50 → easier
- 50-80 → similar
- >80 → advanced

Return ONLY topic name.
`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    const nextTopic =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Try basics";

    res.json({
      score,
      percentage,
      nextTopic
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});