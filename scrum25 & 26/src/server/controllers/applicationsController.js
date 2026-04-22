// src/server/controllers/applicationsController.js
const { applications, CATEGORIES } = require("../data/seed");

function getApplications(req, res) {
  const { resolvedCategory } = req;
  const filtered = resolvedCategory
    ? applications.filter((a) => a.category === resolvedCategory)
    : applications;
  return res.json({ applications: filtered, category: resolvedCategory || "all" });
}

function getApplicationById(req, res) {
  const { id } = req.params;
  const { user } = req;

  const app = applications.find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: "Application not found." });

  if (user.category !== CATEGORIES.ADMIN && app.category !== user.category)
    return res.status(403).json({ error: "Access denied. This application does not belong to your category." });

  return res.json({ application: app });
}

module.exports = { getApplications, getApplicationById };
