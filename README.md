# FixBuddy 🛠️

FixBuddy is an AI-powered web application that helps users diagnose and solve household repair problems with step-by-step DIY plans. Instantly get item diagnosis, repairability scores, safety instructions, and curated tutorial links for a safer and smarter home maintenance experience.

[Live Repo](https://github.com/jamesvo2103/Fix-Buddy)

---

## 🌟 Features

- **AI Diagnosis**: Upload an image or describe your issue — Gemini AI identifies the item, predicts the top issues, and estimates repairability.
- **Dynamic DIY Plans**: Tailored repair steps for beginners, intermediates, and experts with safety notes, tools, part suggestions, and cost estimates.
- **Clarification Questions**: AI automatically asks for clarifications if confidence is low.
- **Video Tutorials**: Recommends the best YouTube/iFixit resources for your identified problem.
- **History**: Track your last 10 repairs for easy access and reference.
- **Safe by Design**: Built-in safety gate blocks high-risk DIY categories and always prioritizes your safety.
- **Accessibility**: Read-aloud repair instructions for a hands-free, accessible experience.
- **Modern UI**: Mobile-responsive React interface with dark mode, quick login, and simple navigation.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI/ML**: Gemini API (`@google/generative-ai`), LangChain
- **APIs**: YouTube Data API (for tutorials)
- **Auth**: JWT-based authentication
- **Utilities**: dotenv, cors, helmet, bcrypt

---

## 🚩 Distinctiveness & Complexity

FixBuddy stands out by combining:
- **Multi-modal input** - accepts both images and text to maximize diagnostic coverage.
- **Repairability Scoring** - provides a quantified, AI-driven "Can I fix it myself?" estimate.
- **Dynamic tutorials** - fetches repair videos and guides tailored to your specific device and fault.
- **Clarification logic** - intelligently queries for missing details only if necessary, reducing user frustration.
- **No third-party mapping dependencies** - all local shop suggestions are handled without Google Maps, for privacy and portability.

---

## 📁 File Structure

- `frontend/` – React frontend (user dashboard, diagnosis flow, login/register, etc.)
- `backend/` – Node.js/Express backend (API routes, AI agent, authentication, MongoDB models)
- `.env` – Secrets, API keys, and database URLs (see setup below)
- `README.md` – Project documentation (this file)

---

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/jamesvo2103/Fix-Buddy.git
cd Fix-Buddy
```

### 2. Frontend Setup (`client`)

```
cd frontend
npm install
npm run dev
```

### 3. Backend Setup (`server`)

```
cd backend
npm install
npm run server
```

### 4. Environment Configuration

- Copy `.env.example` to `.env` in both `client/` and `server/` directories and fill in required values:
  - MongoDB URI
  - Gemini API key
  - JWT secret
  - YouTube API key

---

## 🖥️ Screenshots

<img width="2550" height="1254" alt="fixbuddy" src="https://github.com/user-attachments/assets/8543567c-f3bf-48a1-be2e-5a33dbef0f08" />

---

## 📱 Mobile-Responsiveness

All pages are fully responsive and optimized for mobile and tablet viewing.

---

## 👩‍💻 Authors

**Andrea Tran - tran3ah@mail.uc.edu**  
Computer Engineering - University of Cincinnati, Class of 2029  
**James Vo - vongochieu2103@gmail.com**  
Computer Engineering - Villanova University, Class of 2028

---

## 📌 Additional Notes

- No data leaves your device except necessary API calls for diagnosis and tutorial recommendations.
- FixBuddy does not use browser location or Google Maps APIs.
- For additional support or contributions, open an issue or pull request on GitHub.

---

Start diagnosing and fixing smarter — with **FixBuddy**! 🛠️
