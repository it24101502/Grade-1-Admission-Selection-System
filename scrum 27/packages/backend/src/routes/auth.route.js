const express = require("express");
const { ROLES } = require("@school-portal/shared/src/index.cjs");
const { signToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
//  Mock user store – replace with real DB in production
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "user-1", email: "parent@example.com",  password: "parent123",  role: ROLES.PARENT },
  { id: "user-2", email: "judge@example.com",   password: "judge123",   role: ROLES.JUDGE },
  { id: "user-3", email: "admin@example.com",   password: "admin123",   role: ROLES.ADMIN },
];

// POST /auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "email and password required" });
  }

  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    },
  });
});

module.exports = router;
