import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { TopicComparison } from "../models/index.js";

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
  model: "gemini-2.5-pro"
});

// ==============================
//  COMPARE API
// ==============================
app.post("/api/compare", async (req, res) => {
  try {
    const { topic1, topic2 } = req.body;

    if (!topic1 || !topic2) {
      return res.status(400).json({
        error: "Both topic1 and topic2 are required"
      });
    }

    const prompt = `
Compare the following two concepts:

1. ${topic1}
2. ${topic2}

Return ONLY valid JSON:
{
  "topic1": "${topic1}",
  "topic2": "${topic2}",
  "table1": [
    { "basis": "", "topic1": "", "topic2": "" }
  ],
  "table2": [
    { "basis": "", "topic1": "", "topic2": "" }
  ],
  "summary": ""
}

Rules:
- EXACTLY 10 differences
- table1 = 5 BASIC differences
- table2 = 5 ADVANCED differences
- Keep answers short and clear
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
    //  ENSURE 10 POINTS
    // ==============================
    data.table1 = data.table1 || [];
    data.table2 = data.table2 || [];

    while (data.table1.length < 5) {
      data.table1.push({
        basis: "Extra",
        topic1: "Info",
        topic2: "Info"
      });
    }

    while (data.table2.length < 5) {
      data.table2.push({
        basis: "Extra",
        topic1: "Info",
        topic2: "Info"
      });
    }

    data.table1 = data.table1.slice(0, 5);
    data.table2 = data.table2.slice(0, 5);

    // Save to MongoDB
    await TopicComparison.create({ userId: req.body.userId || req.query.userId || "guest", 
      topic1: req.body.topic1,
      topic2: req.body.topic2,
      table1: data.table1,
      table2: data.table2,
      summary: data.summary
    });

    res.json(data);

  } catch (err) {
    console.error(err);

    // fallback response
    res.json({
      topic1: req.body.topic1,
      topic2: req.body.topic2,
      table1: [
        { basis: "Definition", topic1: "Example A", topic2: "Example B" },
        { basis: "Structure", topic1: "Example A", topic2: "Example B" },
        { basis: "Working", topic1: "Example A", topic2: "Example B" },
        { basis: "Usage", topic1: "Example A", topic2: "Example B" },
        { basis: "Complexity", topic1: "Example A", topic2: "Example B" }
      ],
      table2: [
        { basis: "Real World", topic1: "Example A", topic2: "Example B" },
        { basis: "Performance", topic1: "Example A", topic2: "Example B" },
        { basis: "Flexibility", topic1: "Example A", topic2: "Example B" },
        { basis: "Memory", topic1: "Example A", topic2: "Example B" },
        { basis: "Advanced Use", topic1: "Example A", topic2: "Example B" }
      ],
      summary: "Fallback response (Gemini failed)"
    });
  }
});

// ==============================
// TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Topic Compare API running 🚀");
});

// ==============================
// 🚀 RUN SERVER (PORT 5007)
// ==============================
const PORT = 5008;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});