require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb } = require("./config/db");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/results", require("./routes/results"));
app.use("/api/users", require("./routes/users"));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Internal error" }); });

const PORT = process.env.PORT || 4000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}).catch(err => { console.error("DB init failed:", err); process.exit(1); });
