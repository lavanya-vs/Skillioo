import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { AdaptivePlan } from "../models/index.js";

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
//  GENERATE ADAPTIVE PLAN
// ==============================
app.post("/api/adaptive-plan", async (req, res) => {
  try {
    const { goal, level } = req.body;

    if (!goal) {
      return res.status(400).json({
        error: "Goal is required"
      });
    }

    const prompt = `
Create a structured 50-day adaptive learning plan.

Goal: ${goal}
Level: ${level || "Beginner"}

Return ONLY JSON:
{
  "goal": "${goal}",
  "plan": [
    {
      "day": 1,
      "topic": "",
      "task": ""
    }
  ]
}

Rules:
- EXACTLY 50 days
- Start from basics → go to advanced
- Include:
  • learning
  • practice
  • mini projects
  • revision
  • interview prep
- Keep tasks short and practical
- No extra text outside JSON
`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();

    // clean response
    text = text.replace(/```json|```/g, "").trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("JSON parsing failed");
    }

    // ==============================
    // 🛠 ENSURE 50 DAYS
    // ==============================
    data.plan = data.plan || [];

    while (data.plan.length < 50) {
      data.plan.push({
        day: data.plan.length + 1,
        topic: "Extra Topic",
        task: "Additional practice"
      });
    }

    data.plan = data.plan.slice(0, 50);

    // Save to MongoDB
    await AdaptivePlan.create({ userId: req.body.userId || req.query.userId || "guest",  goal: req.body.goal, level: req.body.level, plan: data.plan });

    res.json(data);

  } catch (err) {
    console.error(err);

    // ==============================
    // FALLBACK PLAN
    // ==============================
    const fallback = [];

    for (let i = 1; i <= 50; i++) {
      fallback.push({
        day: i,
        topic: `Topic ${i}`,
        task: "Practice and revise"
      });
    }

    res.json({
      goal: req.body.goal,
      plan: fallback
    });
  }
});

// ==============================
//  TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Adaptive Plan API running 🚀");
});

// ==============================
// 🚀 SERVER (PORT 5010)
// ==============================
const PORT = 5010;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
