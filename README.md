# 🚀 CodePilot AI

> **Review Code Smarter.** — AI-Powered GitHub Code Review Platform

CodePilot AI is an enterprise-grade SaaS platform that provides intelligent code reviews powered by Gemini AI. It detects bugs, security vulnerabilities, performance issues, and code smells — like having a Senior Staff Engineer review every pull request.

---

## ✨ Features

- 🧠 **AI-Powered Review** — Gemini AI analyzes your code for bugs, anti-patterns, and improvements
- 🔒 **Security Scanner** — Detects SQL injection, XSS, hardcoded secrets, and 50+ vulnerabilities
- ⚡ **Performance Analyzer** — Finds N+1 queries, memory leaks, and blocking calls
- 📝 **Documentation Generator** — Auto-generate function docs, API docs, and READMEs
- 🧪 **Test Generator** — Generate pytest, unit tests, and edge cases
- 💬 **AI Chat** — Chat with your repository to understand code
- 📊 **Analytics Dashboard** — Code quality trends, issue tracking, and developer activity
- 👥 **Team Features** — Workspaces, roles, and permissions

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v3, Shadcn UI, Framer Motion, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic, Celery |
| **Database** | PostgreSQL, Redis |
| **AI** | Gemini API (primary), OpenAI (fallback) |
| **Auth** | GitHub OAuth, JWT |
| **Infra** | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Python 3.12+](https://python.org)
- [Docker Desktop](https://docker.com) (optional, for full stack)

### Frontend Only (Development)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Full Stack (Docker)

```bash
# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 📁 Project Structure

```
codepilot-ai/
├── frontend/          # Next.js 15 App
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# UI components
│   │   ├── lib/       # Utilities
│   │   └── providers/ # Context providers
│   └── ...
├── backend/           # FastAPI Application
│   ├── app/
│   │   ├── api/       # API endpoints (versioned)
│   │   ├── core/      # Config, security
│   │   ├── db/        # Database connection
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── main.py    # App entry point
│   └── ...
├── nginx/             # Reverse proxy config
├── docker-compose.yml # Full stack orchestration
└── .env.example       # Environment template
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |
| `DATABASE_URL` | PostgreSQL connection string |

---

## 📄 License

MIT © CodePilot AI
"# Codepilot-Ai" 
