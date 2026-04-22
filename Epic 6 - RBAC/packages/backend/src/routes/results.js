const express = require("express");
const router = express.Router();
const { authenticate, requirePermission } = require("../middleware/auth");
const { listResults, getResult, createResult } = require("../controllers/resultController");

router.use(authenticate);

router.get("/", requirePermission("results:read"), listResults);
router.get("/:id", requirePermission("results:read"), getResult);
router.post("/", requirePermission("results:write"), createResult);

module.exports = router;
