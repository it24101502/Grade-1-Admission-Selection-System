# Category Access App

> **User Story:** As a parent/user, I want to access only applications related to my category so that I don't see irrelevant data.

## Project Structure

```
category-access-app/
├── .idea/                          ← IntelliJ run configurations (committed)
│   └── runConfigurations/
│       ├── Start_Backend_Server.xml
│       ├── Start_React_Frontend.xml
│       ├── Run_Jest_Tests.xml
│       └── Run_Full_Stack.xml      ← Starts both at once
├── src/
│   ├── server/                     ← Express API
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── applicationsController.js
│   │   ├── data/
│   │   │   └── seed.js             ← In-memory users & applications
│   │   ├── middleware/
│   │   │   ├── auth.js             ← JWT verification
│   │   │   └── categoryGuard.js    ← Category enforcement (403 on mismatch)
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── applications.js
│   │   └── index.js                ← Server entry point (port 5000)
│   ├── client/                     ← React SPA
│   │   ├── api/api.js              ← Fetch wrapper
│   │   ├── components/
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── ApplicationDetailPage.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── public/index.html
│   │   └── package.json            ← React scripts (separate install)
│   └── __tests__/
│       └── applications.test.js    ← 11 Jest + Supertest tests
├── .env.example
├── .gitignore
└── package.json                    ← Root: server deps + test/dev scripts
```

---

## Running in IntelliJ IDEA / WebStorm

### One-time setup

**1. Open the project**
```
File → Open → select the category-access-app folder
```
IntelliJ will detect `package.json` and index the project automatically.

**2. Install Node.js plugin** *(if not already installed)*
```
Settings → Plugins → search "Node.js" → Install → Restart
```

**3. Install dependencies**

Open the built-in Terminal (`Alt+F12` / `⌥F12`) and run:
```bash
npm install                        # root (server + dev tools)
npm install --prefix src/client    # React client
```

Or use the npm panel:
- Open `package.json` → click the ▶ next to `install:all` script

**4. Create your `.env` file**
```bash
cp .env.example .env
```
Edit `.env` and set a strong `JWT_SECRET`.

---

### Running the app

IntelliJ run configurations are pre-configured in `.idea/runConfigurations/`.
They will appear automatically in the **Run/Debug dropdown** (top-right toolbar).

| Configuration | What it does |
|---|---|
| **Run Full Stack** ⭐ | Starts backend + frontend together (use this one) |
| **Start Backend Server** | Express API on `http://localhost:5000` |
| **Start React Frontend** | React app on `http://localhost:3000` |
| **Run Jest Tests** | Runs all backend tests with coverage |

**To run:**
1. Select **"Run Full Stack"** from the dropdown
2. Click the green ▶ **Run** button (or `Shift+F10`)
3. Open `http://localhost:3000` in your browser

---

### Running from Terminal

```bash
# Run both servers together
npm run dev

# Backend only
npm start

# Frontend only
npm run start:frontend

# Tests
npm test
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/applications` | JWT | List (category-filtered) |
| GET | `/api/applications/:id` | JWT | Single app (category-validated) |

---

## Demo Accounts

| Name | Email | Password | Category |
|---|---|---|---|
| Alice Parent | alice@example.com | password123 | school_zone |
| Bob Parent | bob@example.com | password123 | eligibility_type_a |
| Carol Parent | carol@example.com | password123 | eligibility_type_b |
| Admin User | admin@example.com | adminpass | admin |

---

## Push to GitHub

```bash
git init
git add .
git commit -m "feat: category-based application access control"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Acceptance Criteria

| Criteria | Where it's enforced |
|---|---|
| User sees only their category's apps | `categoryGuard.js` middleware + controller filter |
| Cross-category access denied (403) | `categoryGuard.js` + `getApplicationById` validation |
| UI reflects filtered data | Dashboard fetches and renders only what API returns |
| Tested with multiple categories | `src/__tests__/applications.test.js` — 11 tests |
