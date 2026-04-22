# RBAC Login Portal

> **SE — Epic 6: Role-Based Access Control**
> Built from Jira Scrum stories: SCRUM-25 through SCRUM-30

---

## Project Overview

A full-stack **Role-Based Access Control (RBAC)** system implemented as a monorepo.  
Users log in and are granted access **only** to features permitted by their role.

### Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Vite   |
| Backend   | Node.js, Express.js               |
| Database  | SQLite (via better-sqlite3)       |
| Auth      | JWT (JSON Web Tokens)             |
| Monorepo  | npm workspaces                    |

---

## Quick Start

### 1. Install
```bash
cd rbac-monorepo
npm install
```

### 2. Seed the database
```bash
npm run seed
```

### 3. Run both servers
```bash
npm run dev
```

Open http://localhost:5173

---

## Demo Credentials

| Role                    | Email               | Password     |
|-------------------------|---------------------|--------------|
| Admin                   | admin@demo.com      | admin123     |
| Judge                   | judge@demo.com      | judge123     |
| Parent                  | parent@demo.com     | parent123    |
| Document Controller     | docctrl@demo.com    | docctrl123   |

The Login page has quick-fill buttons for each role.

---

## Scrum Story Mapping

| Story      | What was built                                                        |
|------------|-----------------------------------------------------------------------|
| SCRUM-25   | JWT auth + requirePermission() middleware blocks every API route      |
| SCRUM-26   | filterByCategory() middleware — Parents see only their category       |
| SCRUM-27   | Parent role restricted to applications:submit + results:read only     |
| SCRUM-28   | ROLES enum in shared/, seed creates all 4 roles in DB                 |
| SCRUM-29   | ProtectedRoute + RoleRoute guards, manual URL entry redirected        |
| SCRUM-30   | Per-role dashboards, Admin+Judge routes blocked at API + UI layer     |

---

## Structure

```
rbac-monorepo/
├── shared/index.js              ROLES + PERMISSIONS constants
├── packages/backend/src/
│   ├── middleware/auth.js        JWT + RBAC enforcement
│   ├── controllers/             Business logic per resource
│   ├── routes/                  Express route definitions
│   └── config/seed.js           Demo users + sample data
└── packages/frontend/src/
    ├── context/AuthContext.jsx   Token storage + authFetch
    ├── components/RouteGuards.jsx  ProtectedRoute + RoleRoute
    ├── pages/dashboards/         One dashboard per role
    └── App.jsx                   All routes + guards wired up
```
