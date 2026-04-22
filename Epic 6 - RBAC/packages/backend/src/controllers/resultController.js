const { run, get, all } = require("../config/db");
const { ROLES } = require("../../../../shared/index.cjs");

function listResults(req, res) {
  let sql = `SELECT r.*, a.title as application_title, a.category, a.submitted_by, u.name as judge_name
    FROM results r LEFT JOIN applications a ON r.application_id = a.id LEFT JOIN users u ON r.judged_by = u.id`;
  const params = [];
  if (req.user.role === ROLES.PARENT) {
    sql += " WHERE a.submitted_by = ? AND a.category = ?";
    params.push(req.user.id, req.user.category);
  }
  sql += " ORDER BY r.created_at DESC";
  res.json({ results: all(sql, params) });
}

function getResult(req, res) {
  const result = get("SELECT r.*, a.submitted_by FROM results r LEFT JOIN applications a ON r.application_id = a.id WHERE r.id = ?", [req.params.id]);
  if (!result) return res.status(404).json({ error: "Not found" });
  if (req.user.role === ROLES.PARENT && result.submitted_by !== req.user.id)
    return res.status(403).json({ error: "Access Denied" });
  res.json({ result });
}

function createResult(req, res) {
  const { application_id, score, verdict, notes } = req.body;
  if (!application_id || !verdict) return res.status(400).json({ error: "application_id and verdict required" });
  const result = run("INSERT INTO results (application_id, score, verdict, notes, judged_by) VALUES (?, ?, ?, ?, ?)",
    [application_id, score || null, verdict, notes || "", req.user.id]);
  run("UPDATE applications SET status = ? WHERE id = ?",
    [verdict.toLowerCase() === "approved" ? "approved" : "rejected", application_id]);
  res.status(201).json({ message: "Result recorded", resultId: result.lastInsertRowid });
}

module.exports = { listResults, getResult, createResult };
