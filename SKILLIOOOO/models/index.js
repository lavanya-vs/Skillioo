import mongoose from "mongoose";

// ==============================
// 💬 Chatbot Models
// ==============================
const chatSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  sessionId: { type: String, default: "default_session" },
  role: { type: String, required: true }, // 'user' or 'model'
  text: { type: String, required: true },
}, { timestamps: true });

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

// ==============================
// 📚 Course Models
// ==============================
const noteSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  lessonTitle: { type: String, required: true },
  notes: { type: String, required: true },
}, { timestamps: true });

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

// ==============================
// 🧠 Quiz Models
// ==============================
const quizStatSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  userId: { type: String, default: "global_user", unique: true },
  totalQuizzes: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  weakTopics: { type: [String], default: [] }
}, { timestamps: true });

export const QuizStat = mongoose.models.QuizStat || mongoose.model("QuizStat", quizStatSchema);

const quizResultSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  topic: { type: String, required: true },
  difficulty: { type: String },
  score: { type: Number },
  percentage: { type: Number },
}, { timestamps: true });

export const QuizResult = mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);

// ==============================
// 📅 Adaptive Plan Models
// ==============================
const adaptivePlanSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  goal: { type: String, required: true },
  level: { type: String },
  plan: { type: Array, required: true },
}, { timestamps: true });

export const AdaptivePlan = mongoose.models.AdaptivePlan || mongoose.model("AdaptivePlan", adaptivePlanSchema);

// ==============================
// 📊 Topic Compare Models
// ==============================
const topicComparisonSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  topic1: { type: String, required: true },
  topic2: { type: String, required: true },
  table1: { type: Array },
  table2: { type: Array },
  summary: { type: String }
}, { timestamps: true });

export const TopicComparison = mongoose.models.TopicComparison || mongoose.model("TopicComparison", topicComparisonSchema);

// ==============================
// 📄 Resume Recruiter Models
// ==============================
const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  role: { type: String },
  resumeText: { type: String },
  skillsFound: { type: [String] },
  missingSkills: { type: [String] },
  warnings: { type: [String] },
  verdict: { type: String }
}, { timestamps: true });

export const ResumeAnalysis = mongoose.models.ResumeAnalysis || mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

// ==============================
// 🗺️ Roadmap Models
// ==============================
const roadmapSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  topic: { type: String, required: true },
  nodes: { type: Array },
  edges: { type: Array },
}, { timestamps: true });

export const Roadmap = mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema);

// ==============================
// 🧪 Explain Code Models
// ==============================
const codeExplanationSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  code: { type: String, required: true },
  language: { type: String },
  steps: { type: Array },
  finalOutput: { type: String }
}, { timestamps: true });

export const CodeExplanation = mongoose.models.CodeExplanation || mongoose.model("CodeExplanation", codeExplanationSchema);

// ==============================
// 💻 Compiler Models
// ==============================
const codeExecutionSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  output: { type: String },
  error: { type: String },
  aiFix: { type: String },
  fixedCode: { type: String },
  status: { type: String }
}, { timestamps: true });

export const CodeExecution = mongoose.models.CodeExecution || mongoose.model("CodeExecution", codeExecutionSchema);
