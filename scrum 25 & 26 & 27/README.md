# School Portal — Monorepo

Role-based access control (RBAC) system implementing the **Parent Permission Restriction** user story.

---

## Jira Story Coverage

| Acceptance Criteria | Implementation |
|---|---|
| Parent can only apply & view results | `ROLE_PERMISSIONS[ROLES.PARENT]` in `shared/permissions.js` |
| Admin/judge actions denied to parent | `requirePermission()` middleware — returns HTTP 403 |
| UI hides unauthorized features | `<PermissionGate>` component + role-aware `<Navigation>` |
| Backend blocks restricted APIs | Express middleware on every protected route |
| Tested with parent role | `backend/__tests__/permissions.test.js` + `shared/__tests__/permissions.test.js` |

---

## Monorepo Structure

```
school-portal/
├── package.json                     ← workspace root
└── packages/
    ├── shared/                      ← shared RBAC logic (roles, permissions)
    │   └── src/
    │       ├── permissions.js
    │       └── __tests__/
    ├── backend/                     ← Express REST API
    │   └── src/
    │       ├── server.js
    │       ├── middleware/
    │       │   ├── auth.middleware.js
    │       │   └── permissions.middleware.js
    │       ├── routes/
    │       │   ├── auth.route.js
    │       │   ├── applications.route.js
    │       │   ├── results.route.js
    │       │   └── admin.route.js
    │       └── __tests__/
    └── frontend/                    ← React + Vite SPA
        └── src/
            ├── context/AuthContext.jsx
            ├── hooks/usePermission.js
            ├── components/
            │   ├── PermissionGate.jsx
            │   ├── ProtectedRoute.jsx
            │   └── Navigation.jsx
            ├── pages/
            │   ├── LoginPage.jsx
            │   ├── DashboardPage.jsx
            │   ├── ApplyPage.jsx
            │   ├── ResultsPage.jsx
            │   └── UnauthorizedPage.jsx
            └── __tests__/
```

---

## Role → Permission Map

| Permission | Parent | Judge | Admin |
|---|:---:|:---:|:---:|
| `submit_application` | ✅ | ❌ | ✅ |
| `view_own_application` | ✅ | ❌ | ✅ |
| `view_own_results` | ✅ | ✅ | ✅ |
| `review_applications` | ❌ | ✅ | ✅ |
| `score_application` | ❌ | ✅ | ✅ |
| `view_all_applications` | ❌ | ✅ | ✅ |
| `manage_users` | ❌ | ❌ | ✅ |
| `manage_roles` | ❌ | ❌ | ✅ |
| `view_all_results` | ❌ | ❌ | ✅ |
| `configure_system` | ❌ | ❌ | ✅ |
| `export_data` | ❌ | ❌ | ✅ |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp packages/backend/.env.example  packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

### 3. Run in development

```bash
npm run dev
```

- Backend: http://localhost:3001  
- Frontend: http://localhost:5173

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Parent | parent@example.com | parent123 |
| Judge | judge@example.com | judge123 |
| Admin | admin@example.com | admin123 |

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Get JWT token |

### Applications
| Method | Path | Required Permission | Description |
|---|---|---|---|
| POST | `/api/applications` | `submit_application` | Parent submits application |
| GET | `/api/applications/my` | `view_own_application` | Parent views own apps |
| GET | `/api/applications` | `view_all_applications` | Judge/admin views all |
| PUT | `/api/applications/:id/score` | `score_application` | Judge scores app |

### Results
| Method | Path | Required Permission | Description |
|---|---|---|---|
| GET | `/api/results/my` | `view_own_results` | Parent views own results |
| GET | `/api/results` | `view_all_results` | Admin views all results |

### Admin
| Method | Path | Required Permission | Description |
|---|---|---|---|
| GET | `/api/admin/users` | `manage_users` | List all users |
| PUT | `/api/admin/users/:id/role` | `manage_roles` | Change user role |
| GET | `/api/admin/export` | `export_data` | Export data |

---

## Running Tests

```bash
# All packages
npm test

# Individual packages
npm test --workspace=packages/shared
npm test --workspace=packages/backend
npm test --workspace=packages/frontend
```

---

## Push to GitHub

```bash
cd school-portal
git init
git add .
git commit -m "feat: parent permission restriction (JIRA story)"
git remote add origin https://github.com/YOUR_ORG/school-portal.git
git push -u origin main
```
