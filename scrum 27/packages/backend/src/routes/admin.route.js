const express = require("express");
const { PERMISSIONS } = require("@school-portal/shared/src/index.cjs");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/permissions.middleware");

const router = express.Router();

router.use(authenticateToken);

// All routes here require MANAGE_USERS permission (admin only)
router.use(requirePermission(PERMISSIONS.MANAGE_USERS));

// GET /admin/users
router.get("/users", (req, res) => {
  const users = [
    { id: "user-1", email: "parent@example.com", role: "parent" },
    { id: "user-2", email: "judge@example.com",  role: "judge" },
    { id: "user-3", email: "admin@example.com",  role: "admin" },
  ];
  return res.json({ success: true, data: users });
});

// PUT /admin/users/:id/role
router.put(
  "/users/:id/role",
  requirePermission(PERMISSIONS.MANAGE_ROLES),
  (req, res) => {
    const { role } = req.body;
    return res.json({
      success: true,
      data: { userId: req.params.id, newRole: role, updatedBy: req.user.id },
    });
  }
);

// GET /admin/export
router.get(
  "/export",
  requirePermission(PERMISSIONS.EXPORT_DATA),
  (req, res) => {
    return res.json({ success: true, data: { exportedAt: new Date().toISOString() } });
  }
);

module.exports = router;
