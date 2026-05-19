# 🚀 TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, Kanban boards, and real-time dashboards.

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

---

Made with ❤️ for the Full-Stack Assignment

# Ethara_Assignment
