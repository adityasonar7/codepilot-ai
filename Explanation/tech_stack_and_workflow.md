# 🚀 CodePilot AI — Tech Stack & System Workflow Architecture

> **Enterprise-Grade AI-Powered Code Review & Repository Analysis Platform**

---

## 🏗️ 1. Complete Tech Stack Breakdown

### 🎨 Frontend Layer
* **Framework**: Next.js 16 (App Router), React 19, TypeScript
* **Styling & UI**: Tailwind CSS v3, PostCSS, Radix UI Primitives (`Dialog`, `Dropdown Menu`, `Avatar`, `Accordion`, `Progress`, `Tabs`), Lucide React Icons
* **Animations**: Framer Motion (smooth UI transitions and micro-interactions)
* **State & Data Fetching**: TanStack React Query v5, Axios (with automatic JWT bearer token request interceptors)
* **Forms & Validation**: React Hook Form, Zod
* **Data Visualization**: Recharts (for rendering code quality metrics, security trends, and performance scores)
* **Theme Management**: `next-themes` (Dark & Light mode support)

---

### ⚡ Backend Layer
* **Core Framework**: FastAPI 0.115 (Asynchronous Python web framework running on Uvicorn ASGI server)
* **Application Factory**: Fast-API lifespan context for database connection management, CORS middleware, and auto-generated OpenAPI docs (`/api/docs`)
* **Database ORM & Migrations**: SQLAlchemy 2.0 (Async extension with `asyncpg` driver for PostgreSQL), Alembic migration framework
* **Asynchronous Task Queue**: Celery 5.4 distributed task queue backed by Redis broker
* **Authentication & Security**: GitHub OAuth 2.0 integration, JWT authentication (`python-jose`, `passlib` with bcrypt hashing)
* **AI Provider Engines**:
  * **Primary**: Google Gemini API (`google-generativeai`) for intelligent code analysis and review generation
  * **Fallback**: OpenAI API (`openai`)
* **GitHub API Client**: PyGithub & HTTPX (for fetching PR diffs, commits, and setting up repository webhooks)
* **Static Analysis Tooling**: Bandit (security audit), Radon (cyclomatic complexity), Flake8, Pylint, Mypy
* **Logging & Monitoring**: Loguru & Sentry SDK (`sentry-sdk[fastapi]`)

---

### 💾 Database & Cache Layer
* **PostgreSQL 16**: Primary relational database for storing user profiles, connected repositories, review logs, and workspace settings
* **Redis 7**: In-memory cache and message broker for Celery background workers

---

### 🐳 Infrastructure & DevOps
* **Docker & Docker Compose**: Full-stack container orchestration configured in `docker-compose.yml`:
  1. `postgres`: Database service on port `5432`
  2. `redis`: Caching & task broker on port `6379`
  3. `backend`: FastAPI app service on port `8000`
  4. `celery-worker`: Distributed review worker process
  5. `frontend`: Next.js application on port `3000`
  6. `nginx`: Reverse proxy routing requests on port `80`

---

## 📁 2. Project Directory Structure

```
codepilot-ai/
├── Explanation/                  # Project documentation & architectural guides
│   └── tech_stack_and_workflow.md
├── frontend/                     # Next.js 16 App Router application
│   ├── src/
│   │   ├── app/                  # Route handlers & pages (login, dashboard, analytics)
│   │   ├── components/           # UI components & dashboard modals
│   │   ├── lib/                  # Axios API client & utils
│   │   └── providers/            # React Query & Theme providers
│   └── package.json
├── backend/                      # FastAPI Python application
│   ├── app/
│   │   ├── api/v1/               # Versioned REST endpoints (auth, github)
│   │   ├── core/                 # Config, security, Celery app setup
│   │   ├── db/                   # Async Database session & models
│   │   ├── models/               # SQLAlchemy ORM models (User, Repository)
│   │   ├── schemas/              # Pydantic data validation schemas
│   │   ├── services/             # GitHub API client & AI services
│   │   ├── tasks/                # Asynchronous Celery background tasks
│   │   └── main.py               # FastAPI application entry point
│   └── requirements.txt
├── nginx/                        # Nginx reverse proxy configuration
└── docker-compose.yml            # Multi-container orchestration
```

---

## 🔄 3. End-to-End System Workflows

```
+-----------------------------------------------------------------------------------+
|                                 SYSTEM WORKFLOW                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ User ] ----> ( Next.js Frontend ) ----> ( GitHub OAuth )                       |
|                       |                                                           |
|                       v                                                           |
|                 [ JWT Auth ]                                                      |
|                       |                                                           |
|                       v                                                           |
|              ( FastAPI Backend ) <----> [ PostgreSQL ]                            |
|                       |                                                           |
|                       +---> ( Connect Repo & Webhook )                            |
|                                       |                                           |
|                                       v                                           |
|                              [ GitHub PR Event ]                                  |
|                                       |                                           |
|                                       v                                           |
|                              ( Redis Task Queue )                                 |
|                                       |                                           |
|                                       v                                           |
|                             ( Celery Worker Task )                                |
|                                   /         \                                     |
|                                  /           \                                    |
|                   [ Static Analyzers ]     [ Gemini AI API ]                      |
|                                  \           /                                    |
|                                   \         /                                     |
|                                       v                                           |
|                       [ AI Review & Scores Saved ]                                |
|                                       |                                           |
|                                       +---> [ Inline PR Comments on GitHub ]       |
|                                       |                                           |
|                                       +---> [ Dashboard Telemetry & Recharts ]    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Detailed Workflow Phases

#### 🔑 Phase 1: User Authentication & Session Setup
1. User clicks **Login with GitHub** on the Next.js frontend (`/login`).
2. User is redirected to GitHub's OAuth consent page.
3. Upon approval, GitHub redirects back to the frontend with an authorization `code`.
4. Frontend sends the code to the backend API endpoint (`POST /api/v1/auth/github` in `backend/app/api/v1/endpoints/auth.py`).
5. FastAPI exchanges the code with GitHub to retrieve user info and OAuth access tokens.
6. User profile is created/updated in PostgreSQL, and backend issues JWT Access & Refresh tokens.
7. Frontend stores the JWT and includes it in all requests via the Axios interceptor (`frontend/src/lib/api.ts`).

#### 🔗 Phase 2: Repository Connection & Webhook Provisioning
1. User opens the **Connect Repository** modal in the frontend dashboard.
2. Frontend requests available repos via `GET /api/v1/github/repos`.
3. `GitHubClient` (`backend/app/services/github_client.py`) fetches user repositories via GitHub REST API.
4. User selects a repository and clicks **Connect**.
5. Backend sets up a GitHub Webhook on the target repository to listen for incoming Pull Request events.

#### 🤖 Phase 3: Automated Asynchronous PR Review Pipeline
1. When a developer opens or updates a Pull Request on GitHub, a webhook payload is sent to FastAPI.
2. FastAPI validates the webhook signature and dispatches an asynchronous review task (`review.analyze_pr`) to Celery via Redis (`backend/app/tasks/review_tasks.py`).
3. Celery Worker picks up the job:
   * Downloads PR code diffs and metadata using `PyGithub`.
   * Executes static security and complexity tools (`bandit`, `radon`, `flake8`).
   * Sends diff context and static audit results to **Gemini AI API** (`google-generativeai`).
   * Gemini analyzes code for bugs, vulnerability risks, performance bottlenecks, and best practices.
4. Celery worker formats findings, stores review reports in PostgreSQL, and posts automated inline comments to the GitHub PR.

#### 📊 Phase 4: Dashboard Telemetry & Real-Time Analytics
1. Next.js Dashboard (`/dashboard`) queries `/api/v1/reviews` and quality analytics endpoints.
2. React Query manages caching, state updates, and background refetching.
3. Interactive UI displays repository health scores, security warnings, and performance graphs rendered using Recharts and Shadcn UI components.

---

## 🎯 Key Repository References
* `README.md` — Project overview and setup instructions
* `docker-compose.yml` — Container orchestration for Postgres, Redis, FastAPI, Celery, Next.js, and Nginx
* `backend/app/main.py` — FastAPI application entry point
* `backend/app/api/v1/endpoints/auth.py` — GitHub OAuth authentication & JWT logic
* `backend/app/api/v1/endpoints/github.py` — Repository management & webhook endpoints
* `backend/app/tasks/review_tasks.py` — Asynchronous Celery PR review tasks
* `frontend/src/lib/api.ts` — Axios HTTP client configuration with auth interceptor
