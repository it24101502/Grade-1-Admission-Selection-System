const express = require("express");
const { PERMISSIONS } = require("@school-portal/shared/src/index.cjs");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  requirePermission,
  requireOwnership,
} = require("../middleware/permissions.middleware");

const router = express.Router();

// ── All routes require a valid JWT ────────────────────────────────────────────
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /applications
//  Parent submits a new application.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  requirePermission(PERMISSIONS.SUBMIT_APPLICATION),
  (req, res) => {
    const { childName, grade, notes } = req.body;

    if (!childName || !grade) {
      return res
        .status(400)
        .json({ success: false, error: "childName and grade are required" });
    }

    // In a real app: persist to DB here
    const newApplication = {
      id: `app-${Date.now()}`,
      userId: req.user.id,
      childName,
      grade,
      notes: notes ?? "",
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    return res.status(201).json({ success: true, data: newApplication });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /applications/my
//  Parent views their own applications.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/my",
  requirePermission(PERMISSIONS.VIEW_OWN_APPLICATION),
  (req, res) => {
    // In a real app: query DB for applications where userId = req.user.id
    const mockApplications = [
      {
        id: "app-001",
        userId: req.user.id,
        childName: "Alice Smith",
        grade: "5",
        status: "under_review",
        submittedAt: "2024-03-01T10:00:00Z",
      },
    ];

    return res.json({ success: true, data: mockApplications });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /applications          (judge / admin only)
//  View ALL applications.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/",
  requirePermission(PERMISSIONS.VIEW_ALL_APPLICATIONS),
  (req, res) => {
    const allApplications = [
      { id: "app-001", userId: "user-1", childName: "Alice", grade: "5", status: "under_review" },
      { id: "app-002", userId: "user-2", childName: "Bob",   grade: "3", status: "pending" },
    ];

    return res.json({ success: true, data: allApplications });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /applications/:id/score   (judge only)
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  "/:id/score",
  requirePermission(PERMISSIONS.SCORE_APPLICATION),
  (req, res) => {
    const { score, feedback } = req.body;
    if (score === undefined) {
      return res.status(400).json({ success: false, error: "score is required" });
    }

    return res.json({
      success: true,
      data: { applicationId: req.params.id, score, feedback, scoredBy: req.user.id },
    });
  }
);

module.exports = router;
