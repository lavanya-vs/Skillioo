<div align="center">

# SKILLIO

### Learn Smarter. Grow Faster.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

</div>

---

> **PROPRIETARY PROJECT**
> Copying, cloning, or reusing any part of this codebase without explicit written permission from the owner is strictly prohibited. See [License](#license) section for details.

---

## What is Skillio?

Skillio is a full-stack AI-powered skill learning platform that helps users learn any topic through smart adaptive quizzes, personalized roadmaps, a built-in code compiler, an AI chatbot, and much more.

Whether you are a beginner or an expert, Skillio adapts to you — guiding you step by step toward mastery.

---

## Modules

### 1. Quiz Module
**File:** `routes/quiz.js`

- Generate 5 multiple-choice questions on any topic
- Each question has 4 options with one correct answer
- Evaluates your answers and calculates your score instantly
- Recommends the next topic based on your performance:
  - Below 50% — easier topic suggested
  - 50% to 80% — similar level topic suggested
  - Above 80% — advanced topic suggested

---

### 2. Authentication
**File:** `routes/authRoutes.js`

- Secure user registration and login system
- JWT-based session management
- Protects all user data and progress records

---

### 3. Chatbot
**File:** `routes/chatbot.js`

- Ask any doubt or concept question directly in the app
- Get instant, detailed AI-generated explanations
- Supports back-and-forth conversational interaction

---

### 4. Code Compiler
**File:** `routes/compiler.js`

- Write and run code directly in the browser
- No local environment setup required
- Displays real-time output for practice and testing

---

### 5. Course System
**File:** `routes/course.js`

- Browse and access structured, organized courses
- Categorized content for guided and self-paced learning
- Integrated with video and document support

---

### 6. Topic Explainer
**File:** `routes/explainRoutes.js`

- Enter any topic or concept and get a clear, simple explanation
- Useful for quick revision before a quiz or exam
- Breaks down complex ideas into easy language

---

### 7. Resume Recruiter Analyzer
**File:** `routes/resumeRecruiterRoutes.js`

- Upload your resume for AI-powered feedback
- Content is analyzed from a recruiter's point of view
- Highlights strengths, skill gaps, and improvement areas

---

### 8. Learning Roadmap Generator
**File:** `routes/roadmap.js`

- Input any skill or career goal
- Get a structured, step-by-step learning roadmap
- Designed for self-learners who need clear direction

---

### 9. Topic Comparator
**File:** `routes/topicCompareRoutes.js`

- Compare two topics side by side
- Understand key differences, similarities, and use cases
- Helps you make informed decisions about what to study next

---

### 10. Adaptive Study Plan
**File:** `routes/adaptivePlanRoutes.js`

- Generates a personalized study plan based on your goals and performance
- Breaks learning into manageable daily and weekly targets
- Adapts over time as your skill level improves

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Custom CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| File Handling | Multer |
| Authentication | JWT, Dotenv |
| AI Integration | REST-based AI API |
| PDF Support | PDFKit, pdfjs-dist |

---

## Getting Started

> This project is proprietary. Do not use, copy, or redistribute without explicit permission.

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account
- AI API Key (configured in `.env`)

### Installation

```bash
# Step 1 -- Clone the repository (authorized users only)
git clone https://github.com/YOUR-USERNAME/skillio.git

# Step 2 -- Navigate into the project folder
cd skillio/SKILLIOOOO

# Step 3 -- Install all dependencies
npm install

# Step 4 -- Create your environment file and add:
# MONGO_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_api_key
# PORT=5000

# Step 5 -- Start the development server
npm run dev
```

---

## Project Structure

```
SKILLIOOO NEW/
|
|-- SKILLIOOOO/
|   |-- routes/
|   |   |-- quiz.js                   [Quiz Module]
|   |   |-- authRoutes.js             [Authentication]
|   |   |-- chatbot.js                [Chatbot]
|   |   |-- compiler.js               [Code Compiler]
|   |   |-- course.js                 [Course System]
|   |   |-- explainRoutes.js          [Topic Explainer]
|   |   |-- resumeRecruiterRoutes.js  [Resume Recruiter Analyzer]
|   |   |-- roadmap.js                [Learning Roadmap Generator]
|   |   |-- topicCompareRoutes.js     [Topic Comparator]
|   |   `-- adaptivePlanRoutes.js     [Adaptive Study Plan]
|   |
|   |-- models/
|   |   `-- index.js                  [Mongoose DB Models]
|   |
|   |-- server.js                     [Main Express Server]
|   |-- Skillio.jsx                   [Main React Frontend]
|   `-- package.json
|
|-- skillio_logo_coder.svg
`-- README.md
```

---

## API Endpoints

| Method | Endpoint | Module |
|---|---|---|
| POST | `/generate-quiz` | Quiz Module |
| POST | `/submit-quiz` | Quiz Module |
| POST | `/api/auth/register` | Authentication |
| POST | `/api/auth/login` | Authentication |
| POST | `/api/chatbot` | Chatbot |
| POST | `/api/compiler` | Code Compiler |
| GET  | `/api/courses` | Course System |
| POST | `/api/roadmap` | Roadmap Generator |
| POST | `/api/resume` | Resume Recruiter Analyzer |
| POST | `/api/compare` | Topic Comparator |
| POST | `/api/explain` | Topic Explainer |
| POST | `/api/adaptive-plan` | Adaptive Study Plan |

---

## License

```
Copyright (c) 2026 Skillio. All Rights Reserved.

This software and its source code are the exclusive property of the owner.
No part of this project -- including but not limited to the source code,
design, logic, algorithms, or documentation -- may be copied, modified,
distributed, sublicensed, or used in any form without the express written
permission of the owner.

Unauthorized use of this project is a violation of intellectual property
law and may result in legal action.

All rights reserved.
```

---

<div align="center">

Built by the **Skillio Team**

*"Learn without limits."*

</div>
