# InterviewAI 🚀

> AI-Powered Mock Interview Platform — Practice, get feedback, and land your dream job.

Built with **React + Vite**, **Node.js + Express**, **MongoDB**, and **Google Gemini AI**.

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, protected routes
- 🤖 **AI Interview Engine** — Gemini generates role-specific questions
- 📝 **7 Interview Tracks** — SE, Frontend, Backend, Java, MERN, DSA, HR
- 🎯 **3 Difficulty Levels** — Easy, Medium, Hard
- ⏱️ **Live Interview Session** — Timer, progress bar, auto-save
- 📊 **AI Evaluation** — Score, strengths, weaknesses, model answers
- 📈 **Analytics Dashboard** — Charts, topic scores, trends (Chart.js)
- 📄 **Resume Analyzer** — PDF upload + ATS analysis
- 👤 **User Profile** — Edit info, stats, change password
- 📱 **Fully Responsive** — Mobile + Desktop

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Routing    | React Router v6                     |
| HTTP       | Axios                               |
| Charts     | Chart.js + react-chartjs-2          |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas + Mongoose            |
| Auth       | JWT + bcryptjs                      |
| AI         | Google Gemini Pro API               |
| Deploy     | Vercel (frontend) + Render (backend)|

---

## 📁 Project Structure

```
interviewai/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── interview.controller.js
│   │   ├── user.controller.js
│   │   ├── analytics.controller.js
│   │   └── resume.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Interview.model.js
│   │   └── Analytics.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── interview.routes.js
│   │   ├── user.routes.js
│   │   ├── analytics.routes.js
│   │   └── resume.routes.js
│   ├── services/
│   │   ├── gemini.service.js
│   │   └── analytics.service.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/AppLayout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── InterviewSetup.jsx
    │   │   ├── InterviewSession.jsx
    │   │   ├── InterviewResults.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── History.jsx
    │   │   ├── Profile.jsx
    │   │   ├── ResumeAnalyzer.jsx
    │   │   └── NotFound.jsx
    │   ├── services/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit VITE_API_URL if needed
npm run dev
```

### 3. Open in browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🔧 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/interviewai
JWT_SECRET=your_32_char_min_secret_key_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

### Backend → Render

1. Push backend to GitHub
2. Create new **Web Service** on Render
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables
6. Deploy

### Frontend → Vercel

1. Push frontend to GitHub
2. Import on Vercel
3. Framework: **Vite**
4. Add env var: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy

---

## 📡 API Endpoints

```
POST   /api/auth/register         Register
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user

GET    /api/interviews            List interviews
POST   /api/interviews            Create interview (AI generates questions)
GET    /api/interviews/:id        Get interview
PATCH  /api/interviews/:id/start  Start session
PATCH  /api/interviews/:id/answer Save answer
POST   /api/interviews/:id/complete Evaluate all answers with AI

GET    /api/analytics             Get analytics + charts data
POST   /api/analytics/refresh     Recalculate analytics

GET    /api/users/profile         Get profile
PATCH  /api/users/profile         Update profile
PATCH  /api/users/password        Change password

POST   /api/resume/analyze        Analyze PDF resume (multipart)
```

---

## 📊 Database Schemas

**User** — name, email, password (hashed), bio, skills, totalInterviews, averageScore, bestScore

**Interview** — user ref, role, difficulty, totalQuestions, questions[], status, overallScore, overallFeedback, topicScores[]

**Question** (embedded) — question, category, difficulty, userAnswer, timeSpent, evaluation{ score, strengths, weaknesses, betterAnswer, suggestions }

**Analytics** — user ref, roleBreakdown[], topicPerformance[], monthlyProgress[], scoreHistory[]

---

## 🎨 Design System

- **Colors**: Indigo/violet gradient palette, dark surface layers
- **UI Pattern**: Glassmorphism cards on dark background
- **Typography**: Inter (UI) + JetBrains Mono (code/answers)
- **Animations**: Subtle fade-in, slide-up, progress transitions

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens (7-day expiry)
- Rate limiting on all API routes (stricter on auth)
- Helmet.js security headers
- CORS configured for specific origin
- Input validation on all endpoints

---

Built as a portfolio project demonstrating full-stack development with AI integration.
