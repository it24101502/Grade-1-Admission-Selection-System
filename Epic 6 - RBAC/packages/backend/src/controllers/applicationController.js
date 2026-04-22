const { run, get, all } = require("../config/db");
const { ROLES } = require("../../../../shared/index.cjs");

function listApplications(req, res) {
  let sql = "SELECT a.*, u.name as submitter_name FROM applications a LEFT JOIN users u ON a.submitted_by = u.id";
  const params = [];

  if (req.categoryFilter) {
    sql += " WHERE a.category = ?";
    params.push(req.categoryFilter);
    if (req.user.role === ROLES.PARENT) {
      sql += " AND a.submitted_by = ?";
      params.push(req.user.id);
    }
  }
  sql += " ORDER BY a.created_at DESC";
  res.json({ applications: all(sql, params) });
}

function getApplication(req, res) {
  const app = get("SELECT a.*, u.name as submitter_name FROM applications a LEFT JOIN users u ON a.submitted_by = u.id WHERE a.id = ?", [req.params.id]);
  if (!app) return res.status(404).json({ error: "Not found" });
  if (req.user.role === ROLES.PARENT && (app.category !== req.user.category || app.submitted_by !== req.user.id))
    return res.status(403).json({ error: "Access Denied" });
  res.json({ application: app });
}

function createApplication(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const category = req.user.category || req.body.category;
  if (!category) return res.status(400).json({ error: "Category required" });
  const result = run("INSERT INTO applications (title, description, category, submitted_by, status) VALUES (?, ?, ?, ?, 'pending')",
    [title, description || "", category, req.user.id]);
  res.status(201).json({ message: "Application submitted", applicationId: result.lastInsertRowid });
}

function updateApplication(req, res) {
  const app = get("SELECT * FROM applications WHERE id = ?", [req.params.id]);
  if (!app) return res.status(404).json({ error: "Not found" });
  const { title, description, status } = req.body;
  run("UPDATE applications SET title = ?, description = ?, status = ? WHERE id = ?",
    [title ?? app.title, description ?? app.description, status ?? app.status, req.params.id]);
  res.json({ message: "Updated" });
}

function deleteApplication(req, res) {
  run("DELETE FROM applications WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
}

module.exports = { listApplications, getApplication, createApplication, updateApplication, deleteApplication };
