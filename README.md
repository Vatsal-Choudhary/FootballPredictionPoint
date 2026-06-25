# ⚽ World Cup Predictor 2026

A full-stack web application for FIFA World Cup 2026 match predictions. Create private leagues, predict match scores, and compete with friends on the leaderboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- **🔐 Authentication** — Register with email verification (Nodemailer), JWT-based sessions
- **🏆 Match Predictions** — Predict scores for all 104 World Cup matches before the lock time
- **👥 Private Groups** — Create prediction leagues and invite friends via unique codes or email
- **📊 Live Leaderboards** — Global and per-group rankings with real-time point updates
- **⚡ Auto-Scoring** — Cron job fetches live results from [WorldCup26 API](https://worldcup26.ir) and calculates points automatically
- **🛡️ Admin Dashboard** — Override results, trigger score recalculations, view platform stats
- **📱 Responsive Design** — Premium dark UI with glassmorphism, works on all devices

## 🎯 Scoring System

| Prediction Outcome | Points |
|---|---|
| Exact score (e.g., predicted 2-1, result 2-1) | **5** |
| Correct goal difference (e.g., predicted 2-0, result 3-1) | **3** |
| Correct match result (win/draw/loss) | **1** |
| Wrong prediction | **0** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL with pgcrypto |
| Auth | JWT + bcrypt + Nodemailer email verification |
| External API | [WorldCup26](https://worldcup26.ir/api-docs) (free, no API key) |
| Cron | node-cron (every 5 min during matches) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd worldcup-predictor
```

### 2. Set up the database

```bash
# Create the database
createdb worldcup_predictor

# Run the schema migration
psql -d worldcup_predictor -f server/src/db/schema.sql

# Seed teams and fixtures
psql -d worldcup_predictor -f server/src/db/seed.sql
```

### 3. Configure the backend

```bash
cd server
cp .env.example .env
# Edit .env with your database URL, JWT secret, and SMTP credentials
npm install
```

### 4. Configure the frontend

```bash
cd client
npm install
```

### 5. Start development servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

---

## 🗄️ Database Schema

```
users          ─── groups (via group_members)
  │                    │
  └── predictions ─── matches ─── teams
```

- **users** — Accounts with email verification and admin flag
- **groups** — Private prediction leagues with invite codes
- **group_members** — Many-to-many user/group memberships
- **teams** — 48 qualified national teams
- **matches** — All fixtures with lock times and live scores
- **predictions** — User predictions with auto-calculated points

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register with email verification |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/auth/verify-email?token=` | No | Verify email address |

### Matches & Predictions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/matches` | Yes | List matches (filterable) |
| POST | `/api/predictions` | Yes | Submit/update prediction |
| GET | `/api/predictions/my` | Yes | My predictions |
| GET | `/api/predictions/leaderboard` | Yes | Global rankings |

### Groups
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/groups` | Yes | Create group |
| POST | `/api/groups/join` | Yes | Join via invite code |
| GET | `/api/groups/my` | Yes | My groups |
| GET | `/api/groups/:id/leaderboard` | Yes | Group rankings |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/api/admin/matches/:id/result` | Admin | Override match result |
| POST | `/api/admin/recalculate` | Admin | Recalculate all scores |
| GET | `/api/admin/stats` | Admin | Platform statistics |

---

## 🚢 Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `server/`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables from `.env.example`
6. Add a **PostgreSQL** database and link `DATABASE_URL`

### Frontend → Vercel

1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `client/`
3. Framework preset: Vite
4. Add env variable: `VITE_API_URL=https://your-render-backend.onrender.com`

---

## 🐛 Debugging (VS Code)

The project includes a `.vscode/launch.json` with configurations:

- **Debug Server** — Launch the Node.js server with debugger attached
- **Debug Server (Nodemon)** — Launch with hot-reload and debugger
- **Run Tests** — Run Jest tests with debugger
- **Attach to Running Server** — Attach to an already-running server on port 9229

---

## 📝 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `JWT_EXPIRES_IN` | Token expiration (default: 7d) | ❌ |
| `PORT` | Server port (default: 5000) | ❌ |
| `CLIENT_URL` | Frontend URL for CORS/emails | ✅ |
| `SMTP_HOST` | Email server host | ✅ |
| `SMTP_PORT` | Email server port | ✅ |
| `SMTP_USER` | Email account username | ✅ |
| `SMTP_PASS` | Email account password | ✅ |
| `SMTP_FROM` | From address for emails | ✅ |
| `WORLDCUP_API_URL` | WorldCup26 API base URL | ✅ |

---

## 📄 License

MIT License — feel free to use this for your own World Cup prediction pools!
