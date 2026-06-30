import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { Roadmap } from "../models/index.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//  GEMINI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro"
});

// ==============================
//  GENERATE ADVANCED ROADMAP
// ==============================
app.post("/generate-roadmap", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const prompt = `
Generate a PROFESSIONAL roadmap for "${topic}"

Rules:
- Divide into 3 levels: Beginner, Intermediate, Advanced
- Each level must have 3–5 main topics
- Each main topic must have 2–5 subtopics
- Keep names short
- Maintain logical progression
- Return ONLY JSON

Format:
[
  {
    "level": "Beginner",
    "topics": [
      {
        "title": "Internet",
        "children": ["HTTP", "DNS"]
      }
    ]
  }
]
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    let text = result?.response?.text();

    if (!text) throw new Error("No response from Gemini");

    console.log("RAW:", text);

    //  CLEAN RESPONSE
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON format");
    }

    const jsonString = text.substring(start, end + 1);

    const raw = JSON.parse(jsonString);

    // ==============================
    //  CONVERT TO ADVANCED GRAPH
    // ==============================

    let nodeId = 0;
    const nodes = [];
    const edges = [];

    raw.forEach((levelData, levelIndex) => {
      const levelY = levelIndex * 300;

      levelData.topics.forEach((topicItem, topicIndex) => {
        const parentId = String(nodeId++);

        const parentX = topicIndex * 250;

        //  MAIN NODE
        nodes.push({
          id: parentId,
          label: topicItem.title,
          type: "main",
          level: levelData.level,
          position: { x: parentX, y: levelY }
        });

        //  CONNECT PREVIOUS MAIN NODE
        if (nodes.length > 1) {
          const prevMain = nodes[nodes.length - 2];
          if (prevMain.type === "main") {
            edges.push({
              source: prevMain.id,
              target: parentId,
              type: "smooth"
            });
          }
        }

        //  CHILD NODES
        if (Array.isArray(topicItem.children)) {
          topicItem.children.forEach((child, childIndex) => {
            const childId = String(nodeId++);

            nodes.push({
              id: childId,
              label: child,
              type: "sub",
              level: levelData.level,
              position: {
                x: parentX + 150,
                y: levelY + childIndex * 70 + 50
              }
            });

            edges.push({
              source: parentId,
              target: childId,
              type: "dotted"
            });
          });
        }
      });
    });

    // Save to MongoDB
    await Roadmap.create({ userId: req.body.userId || req.query.userId || "guest", topic, nodes, edges });

    res.json({
      topic,
      nodes,
      edges
    });

  } catch (err) {
    console.error("ROADMAP ERROR:", err);

    res.status(500).json({
      error: "Failed to generate roadmap",
      details: err.message
    });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5003;

app.listen(PORT, () => {
  console.log(`🧠 Advanced Roadmap server running on http://localhost:${PORT}`);
});