const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { run, get } = require("../config/db");
const { ROLES } = require("../../../../shared/index.cjs");

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, category: user.category },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, category: user.category } });
}

function getMe(req, res) {
  const user = get("SELECT id, name, email, role, category, created_at FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
}

function register(req, res) {
  const { name, email, password, role, category } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "name, email, password, role required" });
  if (!Object.values(ROLES).includes(role))
    return res.status(400).json({ error: `Invalid role. Valid: ${Object.values(ROLES).join(", ")}` });

  const existing = get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const hash = bcrypt.hashSync(password, 10);
  const result = run("INSERT INTO users (name, email, password, role, category) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, role, category || null]);
  res.status(201).json({ message: "User created", userId: result.lastInsertRowid });
}

module.exports = { login, getMe, register };
