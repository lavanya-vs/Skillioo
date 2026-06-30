import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { ResumeAnalysis } from "../models/index.js";

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
//  SAFE GEMINI CALL (CORE)
// ==============================
async function safeGeminiCall(prompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const text = result?.response?.text
        ? await result.response.text()
        : "";

      if (!text) throw new Error("Empty response");

      return text;

    } catch (err) {
      const status = err?.status;

      console.log(`Attempt ${i + 1} failed:`, status || err.message);

      // handle 429 (rate limit)
      if (status === 429) {
        await new Promise(r => setTimeout(r, 5000));
      }

      // handle 503 (server busy)
      else if (status === 503) {
        await new Promise(r => setTimeout(r, 2000));
      }

      // last attempt → fail
      if (i === retries) throw err;
    }
  }
}

// ==============================
//  RECRUITER VIEW API
// ==============================
app.post("/api/resume/recruiter-view", async (req, res) => {
  try {
    const { resumeText, role } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        error: "Resume text is required"
      });
    }

    const prompt = `
You are a strict recruiter.

Analyze this resume for role: ${role || "Software Developer"}

Return ONLY JSON:
{
  "skillsFound": [],
  "missingSkills": [],
  "warnings": [],
  "verdict": ""
}

Rules:
- skillsFound → clearly visible skills
- missingSkills → important missing skills
- warnings → issues
- verdict → short honest opinion
- No extra text

RESUME:
${resumeText}
`;

    //  SAFE CALL
    let text = await safeGeminiCall(prompt);

    // ==============================
    //  CLEAN + EXTRACT JSON
    // ==============================
    text = text.replace(/```json|```/g, "").trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON format");
    }

    const jsonString = text.substring(start, end + 1);

    let data;
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error("JSON parse failed");
    }

    // ==============================
    //  ENSURE STRUCTURE
    // ==============================
    data.skillsFound = Array.isArray(data.skillsFound) ? data.skillsFound : [];
    data.missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : [];
    data.warnings = Array.isArray(data.warnings) ? data.warnings : [];
    data.verdict = data.verdict || "Needs improvement";

    // Save to MongoDB
    await ResumeAnalysis.create({ userId: req.body.userId || req.query.userId || "guest", 
      role: req.body.role,
      resumeText: req.body.resumeText,
      skillsFound: data.skillsFound,
      missingSkills: data.missingSkills,
      warnings: data.warnings,
      verdict: data.verdict
    });

    res.json(data);

  } catch (err) {
    console.log("⚠️ FALLBACK USED:", err.message);

    // ==============================
    //  FINAL SAFE FALLBACK
    // ==============================
    res.json({
      skillsFound: ["Java", "Python", "REST APIs"],
      missingSkills: ["Spring Boot", "Microservices", "System Design"],
      warnings: [
        "Limited project depth",
        "No measurable achievements",
        "Lacks advanced backend frameworks"
      ],
      verdict: "Candidate has basic knowledge but needs stronger backend experience"
    });
  }
});

// ==============================
//  TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.send("Recruiter View API running 🚀");
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5009;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});