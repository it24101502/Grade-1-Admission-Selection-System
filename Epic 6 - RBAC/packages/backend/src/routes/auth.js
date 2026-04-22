const express = require("express");
const router = express.Router();
const { login, getMe, register } = require("../controllers/authController");
const { authenticate, requireRole } = require("../middleware/auth");
const { ROLES } = require("../../../../shared/index.cjs");

router.post("/login", login);
router.get("/me", authenticate, getMe);
// Admin registers new users (Scrum-28)
router.post("/register", authenticate, requireRole(ROLES.ADMIN), register);

module.exports = router;
