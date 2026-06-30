<div align="center">

# ðŸŽ“ Skillio

### *Learn Smarter. Grow Faster.*

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#-license)

> **âš ï¸ This is a proprietary project. Copying, cloning, or reusing any part of this codebase without explicit written permission from the owner is strictly prohibited.**

</div>

---

## ðŸ“Œ What is Skillio?

**Skillio** is a full-stack AI-powered skill learning platform that helps users learn any topic through smart, adaptive quizzes, personalized roadmaps, a built-in code compiler, an AI chatbot, and much more.

Whether you're a beginner or an expert, Skillio adapts to *you* â€” guiding you step by step toward mastery.

---

## ðŸ§© Modules & Functionalities

### ðŸ¤– 1. AI Quiz Module
- Enter **any topic** and instantly get **5 multiple-choice questions**
- Each question has 4 options (A, B, C, D) with one correct answer
- Medium difficulty by default, fully AI-generated

### ðŸ“Š 2. Adaptive Learning Engine
- Evaluates your quiz score and **recommends what to study next**
- Score **< 50%** â†’ Moves you to an easier topic
- Score **50â€“80%** â†’ Stays at a similar level
- Score **> 80%** â†’ Advances you to a harder topic
- Tracks your learning progress over time

### ðŸ—ºï¸ 3. Learning Roadmap Generator
- Input a skill or career goal
- Get a **structured, step-by-step learning roadmap**
- Ideal for self-learners who need direction

### ðŸ’¬ 4. AI Chatbot
- Ask any **doubt or concept question** directly in the app
- Get instant, detailed explanations
- Powered by a conversational AI engine

### ðŸ’» 5. Code Compiler
- Write and **run code directly in the browser**
- No setup needed â€” practice coding as you learn
- Supports real-time output

### ðŸ“„ 6. Resume Recruiter Analyzer
- Upload your **resume** and get AI-powered feedback
- Analyzed from a **recruiter's perspective**
- Highlights strengths, gaps, and improvement areas

### ðŸ§  7. Topic Comparator
- Compare **two topics side by side**
- Understand the differences, similarities, and use cases
- Great for decision-making in learning paths

### ðŸ“– 8. Course System
- Browse and access **structured courses**
- Organized content for guided learning
- Video support integrated

### ðŸ’¡ 9. Topic Explainer
- Get a **clear, simple explanation** for any topic
- Useful for quick concept revision before a quiz

### ðŸ§­ 10. Adaptive Study Plan
- Generates a **personalized study plan** based on your goals
- Breaks learning into achievable daily/weekly targets

### ðŸ” 11. Authentication System
- Secure **user registration and login**
- JWT-based session management
- Protects all user data and progress

### ðŸ“ 12. File Upload System
- Upload documents (PDFs, etc.) for **AI-based analysis**
- Used by the Resume Analyzer and Course modules

---

## ðŸ› ï¸ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Custom CSS |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB, Mongoose |
| **File Handling** | Multer |
| **Authentication** | JWT, Dotenv |
| **AI Integration** | REST-based AI API |
| **PDF Generation** | PDFKit, pdfjs-dist |

---

## ðŸš€ Getting Started

> **Note:** This project is proprietary. Do not use, copy or redistribute without permission.

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- AI API Key (configured in `.env`)

### Installation

```bash
# 1. Clone the repository (authorized users only)
git clone https://github.com/YOUR-USERNAME/skillio.git

# 2. Navigate to project folder
cd skillio/SKILLIOOOO

# 3. Install dependencies
npm install

# 4. Set up environment variables
# Create a .env file and add:
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_api_key
PORT=5000

# 5. Start the server
npm run dev
```

---

## ðŸ“ Project Structure

```
SKILLIOOO NEW/
â”‚
â”œâ”€â”€ SKILLIOOOO/
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”œâ”€â”€ authRoutes.js             # ðŸ” Authentication
â”‚   â”‚   â”œâ”€â”€ quiz.js                   # ðŸ¤– Quiz generation & submission
â”‚   â”‚   â”œâ”€â”€ chatbot.js                # ðŸ’¬ AI Chatbot
â”‚   â”‚   â”œâ”€â”€ compiler.js               # ðŸ’» Code Compiler
â”‚   â”‚   â”œâ”€â”€ course.js                 # ðŸ“– Course System
â”‚   â”‚   â”œâ”€â”€ roadmap.js                # ðŸ—ºï¸ Learning Roadmaps
â”‚   â”‚   â”œâ”€â”€ resumeRecruiterRoutes.js  # ðŸ“„ Resume Analyzer
â”‚   â”‚   â”œâ”€â”€ explainRoutes.js          # ðŸ’¡ Topic Explainer
â”‚   â”‚   â”œâ”€â”€ topicCompareRoutes.js     # ðŸ§  Topic Comparator
â”‚   â”‚   â””â”€â”€ adaptivePlanRoutes.js     # ðŸ§­ Adaptive Study Plans
â”‚   â”‚
â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â””â”€â”€ index.js                  # Mongoose DB models
â”‚   â”‚
â”‚   â”œâ”€â”€ server.js                     # Main Express server entry
â”‚   â”œâ”€â”€ Skillio.jsx                   # Main React frontend
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ skillio_logo_coder.svg            # Project logo
â””â”€â”€ README.md
```

---

## ðŸ”Œ API Endpoints

| Method | Endpoint | Module |
|---|---|---|
| `POST` | `/generate-quiz` | AI Quiz Generator |
| `POST` | `/submit-quiz` | Quiz Submission & Scoring |
| `POST` | `/api/auth/register` | User Registration |
| `POST` | `/api/auth/login` | User Login |
| `POST` | `/api/chatbot` | AI Chatbot |
| `POST` | `/api/compiler` | Code Compiler |
| `GET` | `/api/courses` | Course Listing |
| `POST` | `/api/roadmap` | Roadmap Generator |
| `POST` | `/api/resume` | Resume Analyzer |
| `POST` | `/api/compare` | Topic Comparator |
| `POST` | `/api/explain` | Topic Explainer |
| `POST` | `/api/adaptive-plan` | Adaptive Study Plan |

---

## ðŸŽ¯ How the Learning Flow Works

```
User picks a topic
       â†“
Quiz Module generates 5 questions
       â†“
User answers â†’ Score calculated
       â†“
Adaptive Engine recommends next topic
  < 50%  â†’ Easier topic ðŸ“‰
  50-80% â†’ Same level  ðŸ“Š
  > 80%  â†’ Advanced topic ðŸ“ˆ
       â†“
Roadmap & Study Plan updated
       â†“
User keeps growing ðŸš€
```

---

## ðŸ”’ License

```
Copyright (c) 2026 Skillio. All Rights Reserved.

This software and its source code are the exclusive property of the owner.
No part of this project â€” including but not limited to the source code,
design, logic, algorithms, or documentation â€” may be copied, modified,
distributed, sublicensed, or used in any form without the express written
permission of the owner.

Unauthorized use of this project is a violation of intellectual property law
and may result in legal action.

All rights reserved.
```

---

<div align="center">

**Built with ðŸ”¥ and â˜• by the Skillio Team**

*"Learn without limits."*

</div>

