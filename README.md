# 🚀 InterviewAI

An AI-powered mock interview platform built using the MERN stack and Google Gemini AI. Users can practice role-specific interviews, receive AI-generated feedback, and track their performance through interactive analytics dashboards.

---

## 🌟 Features

* 🤖 AI-generated interview questions
* 📝 AI-based answer evaluation and scoring
* 📊 Interactive analytics dashboard
* 🔐 JWT Authentication & Protected Routes
* 📈 Topic-wise performance tracking
* 💾 Automatic answer saving
* 📱 Fully responsive UI
* ⚡ Real-time interview experience

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* Chart.js

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt.js

### Database

* MongoDB Atlas
* Mongoose

### AI Integration

* Google Gemini API

---

## 🏗️ Architecture

```text
React Frontend
      │
      │ Axios + JWT
      ▼
Node.js + Express API
      │
 ┌────┴─────────┐
 ▼              ▼
MongoDB      Gemini AI
```

---

## 📂 Project Structure

```bash
interviewai/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/interviewai.git
cd interviewai
```

---

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Start backend server:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication Flow

```text
User Login/Register
         │
         ▼
Generate JWT Token
         │
         ▼
Protected API Routes
         │
         ▼
Verify Token Middleware
```

---

## 📊 Analytics Dashboard

The platform provides:

* Score Trends
* Monthly Performance Analysis
* Topic-wise Skill Coverage
* Role Distribution Insights
* Interview History Tracking

---

## ⚡ Optimizations

* Parallel AI evaluation using Promise.all()
* Pre-computed analytics for faster dashboard loads
* Embedded MongoDB documents for efficient reads
* Stateless JWT authentication

---

## 🛡️ Security Features

* Password hashing using bcrypt
* JWT-based authentication
* Protected API routes
* Environment variables for secrets
* Rate limiting
* Helmet.js security headers

---

## 🚀 Future Improvements

* Voice-based interviews
* Coding interview editor
* Google OAuth
* WebSocket integration
* Email reminders
* Interview streak tracking

---



## 👨‍💻 Author

**Ayushi Gupta**

Computer Science Engineering Student | Full Stack Developer

---


