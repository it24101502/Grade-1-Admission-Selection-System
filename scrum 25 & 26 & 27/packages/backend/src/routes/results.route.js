const express = require("express");
const { PERMISSIONS } = require("@school-portal/shared/src/index.cjs");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/permissions.middleware");

const router = express.Router();

router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /results/my     — parent sees only their own results
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/my",
  requirePermission(PERMISSIONS.VIEW_OWN_RESULTS),
  (req, res) => {
    // In a real app: query DB for results linked to req.user.id
    const mockResults = [
      {
        applicationId: "app-001",
        childName: "Alice Smith",
        status: "accepted",
        message: "Congratulations! Your application has been accepted.",
        publishedAt: "2024-04-01T09:00:00Z",
      },
    ];

    return res.json({ success: true, data: mockResults });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /results        — admin only: all results
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/",
  requirePermission(PERMISSIONS.VIEW_ALL_RESULTS),
  (req, res) => {
    const allResults = [
      { applicationId: "app-001", userId: "user-1", status: "accepted" },
      { applicationId: "app-002", userId: "user-2", status: "rejected" },
    ];

    return res.json({ success: true, data: allResults });
  }
);

module.exports = router;
