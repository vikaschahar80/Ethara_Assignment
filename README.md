# 🚀 TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, Kanban boards, and real-time dashboards.

## 🌐 Live Demo
> [https://your-frontend-url.railway.app](https://your-frontend-url.railway.app)

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Frontend | React + Vite |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| Deploy | Railway |

---

## ✨ Features

- **Authentication** — Signup / Login with JWT. Persistent sessions.
- **Role-Based Access Control** — Global Admin vs Member roles + Project-level Admin/Member roles
- **Projects** — Create, view, delete projects. Manage team members per project.
- **Kanban Board** — Visual task board with TODO / IN_PROGRESS / DONE columns
- **Tasks** — Create, assign, update status & priority, set due dates
- **Dashboard** — KPI cards, task status bar chart, overdue tasks panel, recent activity
- **Overdue Detection** — Tasks past due date are highlighted throughout the app

---

## 🏗️ Project Structure

```
Assignment4/
├── backend/
│   ├── prisma/schema.prisma      # DB models
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/           # auth.js, rbac.js, validate.js
│   │   ├── routes/               # auth, projects, tasks, users, dashboard
│   │   ├── utils/prisma.js       # Prisma singleton
│   │   └── index.js              # Express entry
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/index.js           # Axios + all API calls
    │   ├── context/AuthContext.jsx
    │   ├── pages/                 # Dashboard, Login, Signup, Projects, ProjectDetail, Tasks
    │   ├── components/Layout.jsx
    │   ├── index.css              # Design system (dark theme)
    │   └── App.jsx
    └── package.json
```

---

## 🔐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | Auth |
| POST | `/api/projects` | Auth |
| GET | `/api/projects/:id` | Member |
| PUT | `/api/projects/:id` | Project Admin |
| DELETE | `/api/projects/:id` | Project Admin |
| POST | `/api/projects/:id/members` | Project Admin |
| DELETE | `/api/projects/:id/members/:userId` | Project Admin |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects/:id/tasks` | Member |
| POST | `/api/projects/:id/tasks` | Member |
| GET | `/api/tasks` | Auth |
| PUT | `/api/tasks/:id` | Assignee / Admin |
| DELETE | `/api/tasks/:id` | Project Admin |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats + overdue |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET in .env
npm install
npx prisma generate
npx prisma db push      # Creates tables
npm run dev             # Starts on :5000
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev             # Starts on :5173
```

---

## 🚂 Railway Deployment

### Step 1 — Push to GitHub
```bash
cd /path/to/Assignment4
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) → **New Project**
2. **Add a PostgreSQL** plugin — Railway auto-creates `DATABASE_URL`

### Step 3 — Deploy Backend
1. **New Service** → Deploy from GitHub → select your repo
2. Set **Root Directory** to `backend`
3. Add Environment Variables:
   ```
   DATABASE_URL=<auto-filled by Railway Postgres plugin>
   JWT_SECRET=your-random-32-char-secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.railway.app
   PORT=5000
   ```
4. Railway will run `npx prisma migrate deploy && node src/index.js`

### Step 4 — Deploy Frontend
1. **New Service** → Deploy from GitHub → same repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
4. Railway will run `npm run build` then serve with `serve dist`

### Step 5 — Verify
Visit your frontend Railway URL → signup → create a project → add tasks!

---

## 🎨 Screenshots

> Add screenshots of your Dashboard, Project Kanban board, and Login page here.

---

## 👤 Test Accounts

After deploying, create test accounts via the Signup page:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@test.com | admin123 | Admin |
| Member User | member@test.com | member123 | Member |

---

## 📝 Database Schema

```prisma
User         → id, name, email, passwordHash, role (ADMIN/MEMBER)
Project      → id, name, description, ownerId
ProjectMember → projectId, userId, role (ADMIN/MEMBER)
Task         → id, title, description, status, priority, dueDate, 
               projectId, assigneeId, createdById
```

---

## 🛡️ Security
- Passwords hashed with **bcrypt** (12 rounds)
- JWTs expire after **7 days**
- All routes protected with JWT middleware
- Input validation via **express-validator** on all POST/PUT routes
- CORS restricted to frontend URL in production

---

Made with ❤️ for the Full-Stack Assignment

# Ethara_Assignment
