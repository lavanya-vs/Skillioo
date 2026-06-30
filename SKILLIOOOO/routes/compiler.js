import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../config/db.js";
import { CodeExecution } from "../models/index.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
//  GEMINI SETUP
// ==============================
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// ==============================
//  TEMP DIRECTORY
// ==============================
const tempDir = path.join(process.cwd(), "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// ==============================
// PYTHON COMMAND FIX
// ==============================
const getPythonCommand = () => {
  if (process.platform === "win32") {
    return "python";
  }
  return "python3";
};

// ==============================
//  RUN CODE + AI FIX
// ==============================
app.post("/run-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language required" });
    }

    let filePath;
    let command;
    const id = Date.now();

    // ==========================
    //  PYTHON
    // ==========================
    if (language.toLowerCase() === "python") {
      filePath = path.join(tempDir, `temp_${id}.py`);
      fs.writeFileSync(filePath, code);
      command = `${getPythonCommand()} "${filePath}"`;
    }

    // ==========================
    // JAVA
    // ==========================
    else if (language.toLowerCase() === "java") {
      const className = `Main${id}`;
      filePath = path.join(tempDir, `${className}.java`);

      const finalCode = code.replace(/class\s+\w+/g, `class ${className}`);
      fs.writeFileSync(filePath, finalCode);

      command = `javac "${filePath}" && java -cp "${tempDir}" ${className}`;
    }

    else {
      return res.status(400).json({ error: "Only Java and Python supported" });
    }

    // ==========================
    // ▶ EXECUTE
    // ==========================
    exec(command, { timeout: 10000 }, async (error, stdout, stderr) => {

      //  CLEANUP
      try {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (language.toLowerCase() === "java") {
          const classFile = filePath.replace(".java", ".class");
          if (fs.existsSync(classFile)) {
            fs.unlinkSync(classFile);
          }
        }
      } catch (e) {
        console.log("Cleanup error:", e.message);
      }

      // ==========================
      // ❌ ERROR → AI FIX
      // ==========================
      if (error) {
        let aiFix = "";
        let fixedCode = "";
        let errorLine = null;

        const errorMessage = stderr || error.message || "Unknown error";

        // ✅ EXTRACT ERROR LINE
        const lineMatch =
          errorMessage.match(/line (\d+)/i) || // Python
          errorMessage.match(/:(\d+):/);       // Java

        if (lineMatch) {
          errorLine = parseInt(lineMatch[1]);
        }

        try {
          const prompt = `
You are an expert ${language} developer.

Fix ALL errors in the code.

STRICT FORMAT:

Mistake:
<list ALL mistakes clearly>

Corrected Code:
\`\`\`
<ONLY FIXED CODE HERE>
\`\`\`

Explanation:
<short explanation>

IMPORTANT:
- Fix ALL syntax errors (missing :, brackets, typos)
- Even small mistakes like extra characters
- Return FULL corrected code
- DO NOT mix languages

CODE:
${code}

ERROR:
${errorMessage}
`;

          const result = await model.generateContent(prompt);

          const text =
            result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            result?.response?.text?.() ||
            "";

          aiFix = text;

          // ✅ EXTRACT FIXED CODE
          const match = text.match(/```[\w]*\n([\s\S]*?)```/);

          if (match && match[1]) {
            fixedCode = match[1].trim();
          } else {
            const parts = text.split("Corrected Code:");
            if (parts[1]) {
              fixedCode = parts[1].split("Explanation:")[0].trim();
            }
          }

        } catch (aiErr) {
          console.log("Gemini Error:", aiErr.message);
          aiFix = "AI could not generate fix";
        }

        // Save Error Execution to DB
        await CodeExecution.create({ userId: req.body.userId || req.query.userId || "guest", 
          code,
          language,
          output: "",
          error: errorMessage,
          aiFix,
          fixedCode,
          status: "Error"
        });

        return res.json({
          output: "",
          error: errorMessage,
          aiFix,
          fixedCode,
          errorLine, //  highlight line
          status: "Error",
        });
      }

      // ==========================
      //  SUCCESS
      // ==========================
      // Save Success Execution to DB
      await CodeExecution.create({ userId: req.body.userId || req.query.userId || "guest", 
        code,
        language,
        output: stdout || "No Output",
        error: "",
        aiFix: "",
        fixedCode: "",
        status: "Success"
      });

      return res.json({
        output: stdout || "No Output",
        error: "",
        aiFix: "",
        fixedCode: "",
        errorLine: null,
        status: "Success",
      });
    });

  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = 5002;

app.listen(PORT, () => {
  console.log(`💻 Server running on http://localhost:${PORT}`);
});