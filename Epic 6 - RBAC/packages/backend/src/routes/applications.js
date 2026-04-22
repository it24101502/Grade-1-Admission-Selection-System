const express = require("express");
const router = express.Router();
const { authenticate, requirePermission, filterByCategory } = require("../middleware/auth");
const {
  listApplications, getApplication, createApplication, updateApplication, deleteApplication
} = require("../controllers/applicationController");

// All routes require auth
router.use(authenticate);

// Scrum-26: Category filter applied to all GET routes
router.get("/", requirePermission("applications:read"), filterByCategory, listApplications);
router.get("/:id", requirePermission("applications:read"), filterByCategory, getApplication);

// Scrum-27: Parents submit
router.post("/", requirePermission("applications:submit"), createApplication);

// Admin/DocCtrl edit
router.put("/:id", requirePermission("applications:write"), updateApplication);
router.delete("/:id", requirePermission("applications:delete"), deleteApplication);

module.exports = router;
