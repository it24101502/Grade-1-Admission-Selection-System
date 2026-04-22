const express = require("express");
const router = express.Router();
const { authenticate, requirePermission } = require("../middleware/auth");
const { listUsers, getUser, deleteUser, updateUser } = require("../controllers/userController");

router.use(authenticate);

router.get("/", requirePermission("users:read"), listUsers);
router.get("/:id", requirePermission("users:read"), getUser);
router.put("/:id", requirePermission("users:write"), updateUser);
router.delete("/:id", requirePermission("users:delete"), deleteUser);

module.exports = router;
