// src/server/routes/applications.js
const express = require("express");
const router  = express.Router();
const { getApplications, getApplicationById } = require("../controllers/applicationsController");
const { authenticateToken } = require("../middleware/auth");
const { categoryGuard }     = require("../middleware/categoryGuard");

router.get("/",    authenticateToken, categoryGuard, getApplications);
router.get("/:id", authenticateToken, getApplicationById);

module.exports = router;
