// src/server/index.js
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const authRoutes        = require("./routes/auth");
const applicationRoutes = require("./routes/applications");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// API routes
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth",         authRoutes);
app.use("/api/applications", applicationRoutes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build");
  app.use(express.static(buildPath));
  app.get("*", (_req, res) => res.sendFile(path.join(buildPath, "index.html")));
}

// 404 / error handlers
app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`✅  Server running → http://localhost:${PORT}`));
}

module.exports = app;
