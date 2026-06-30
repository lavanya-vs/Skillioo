import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { QuizStat, QuizResult } from "../models/index.js";

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
  model: "gemini-2.5-pro",
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
//  GENERATE QUIZ
// ==============================
app.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic required" });
    }

    const prompt = `
Generate 5 ${difficulty || "medium"} level MCQs for "${topic}".

Return ONLY JSON:
[
 {
  "question": "",
  "options": {
    "A": "",
    "B": "",
    "C": "",
    "D": ""
  },
  "answer": "A"
 }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("AI RESPONSE:", text);

    const quiz = safeParseJSON(text);

    if (!quiz || quiz.length === 0) {
      return res.status(500).json({
        error: "AI did not return valid quiz"
      });
    }

    res.json({ quiz });

  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({
      error: "Gemini failed",
      details: err.message
    });
  }
});

// ==============================
// SUBMIT QUIZ + STATS UPDATE
// ==============================
app.post("/submit-quiz", async (req, res) => {
  try {
    const { answers, quiz, topic, difficulty } = req.body;

    let score = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    const percentage = (score / quiz.length) * 100;

    //  UPDATE STATS IN DB
    let stats = await QuizStat.findOne({ userId: req.body.userId || req.query.userId || "guest" });
    if (!stats) {
      stats = new QuizStat({ userId: req.body.userId || req.query.userId || "guest" });
    }

    stats.totalQuizzes++;
    stats.totalScore += percentage;

    //  STREAK
    if (percentage >= 70) {
      stats.streak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
    } else {
      stats.streak = 0;
    }

    //  WEAK TOPICS
    if (percentage < 50) {
      stats.weakTopics.push(topic);
    }

    await stats.save();

    //  Save the Quiz Result
    await QuizResult.create({ userId: req.body.userId || req.query.userId || "guest",  topic, difficulty, score, percentage });

    //  NEXT DIFFICULTY
    let nextDifficulty =
      percentage < 40 ? "easy" :
      percentage < 70 ? "medium" :
      "hard";

    //  NEXT TOPIC
    let nextTopic;

    try {
      const result = await model.generateContent(`
User studied: ${topic}
Score: ${percentage}%

Suggest next topic in one short line.
`);

      nextTopic = result.response.text().trim();
    } catch {
      nextTopic = `${topic} next level`;
    }

    res.json({
      score,
      percentage,
      nextDifficulty,
      nextTopic
    });

  } catch {
    res.status(500).json({ error: "Submission failed" });
  }
});

// ==============================
//  GET STATS 
// ==============================
app.get("/stats", async (req, res) => {
  try {
    let stats = await QuizStat.findOne({ userId: req.body.userId || req.query.userId || "guest" });
    if (!stats) {
      stats = { totalQuizzes: 0, totalScore: 0, bestStreak: 0, weakTopics: [] };
    }

    const avg = stats.totalQuizzes === 0 ? 0 : stats.totalScore / stats.totalQuizzes;

    res.json({
      quizzesTaken: stats.totalQuizzes,
      avgScore: avg.toFixed(2),
      bestStreak: stats.bestStreak,
      weakTopics: [...new Set(stats.weakTopics)].slice(-5)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ==============================
//  SUGGESTED TOPICS
// ==============================
app.get("/suggest-topics", async (req, res) => {
  try {
    let stats = await QuizStat.findOne({ userId: req.body.userId || req.query.userId || "guest" });
    const weakTopics = stats ? stats.weakTopics : [];
    const weak = weakTopics.join(", ");

    let suggestions = [];

    try {
      const result = await model.generateContent(`
Suggest 5 quiz topics based on weak areas: ${weak || "programming basics"}

Return as simple list.
`);

      const text = result.response.text();

      suggestions = text
        .split("\n")
        .map(t => t.replace(/[-*]/g, "").trim())
        .filter(Boolean);

    } catch {
      suggestions = ["Java Basics", "OOP", "DSA", "SQL"];
    }

    res.json({ suggestions });

  } catch {
    res.status(500).json({ error: "Suggestion failed" });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5006;

app.listen(PORT, () => {
  console.log(`🔥 QUIZ SERVER running at http://localhost:${PORT}`);
});