// src/server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { users }      = require("../data/seed");
const { JWT_SECRET } = require("../middleware/auth");

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const user = users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: "Invalid credentials." });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, category: user.category },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, category: user.category } });
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, me };
