// src/server/routes/auth.js
const express = require("express");
const router  = express.Router();
const { login, me }          = require("../controllers/authController");
const { authenticateToken }  = require("../middleware/auth");

router.post("/login", login);
router.get("/me", authenticateToken, me);

module.exports = router;
