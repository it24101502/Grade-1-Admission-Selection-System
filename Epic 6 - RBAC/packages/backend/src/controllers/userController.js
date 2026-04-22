const { run, get, all } = require("../config/db");

function listUsers(req, res) {
  res.json({ users: all("SELECT id, name, email, role, category, created_at FROM users ORDER BY created_at DESC") });
}
function getUser(req, res) {
  const user = get("SELECT id, name, email, role, category, created_at FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user });
}
function deleteUser(req, res) {
  run("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
}
function updateUser(req, res) {
  const user = get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { name, role, category } = req.body;
  run("UPDATE users SET name = ?, role = ?, category = ? WHERE id = ?",
    [name ?? user.name, role ?? user.role, category ?? user.category, req.params.id]);
  res.json({ message: "Updated" });
}
module.exports = { listUsers, getUser, deleteUser, updateUser };
