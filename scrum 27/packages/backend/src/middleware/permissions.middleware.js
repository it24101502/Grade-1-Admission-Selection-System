const { hasPermission } = require("@school-portal/shared/src/index.cjs");

/**
 * Express middleware factory.
 * Usage:  router.get("/path", requirePermission("some_permission"), handler)
 *
 * Expects req.user = { id, role } — set by the JWT middleware upstream.
 */
function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized – no authenticated user",
      });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden – role '${user.role}' cannot perform '${permission}'`,
      });
    }

    next();
  };
}

/**
 * Middleware that requires the user to own the resource.
 * Compares req.params.userId (or req.body.userId) with req.user.id.
 * Admins bypass ownership checks.
 */
function requireOwnership(req, res, next) {
  const user = req.user;
  const resourceOwnerId =
    req.params.userId || req.body?.userId || req.query?.userId;

  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (user.role === "admin") return next(); // admins see everything

  if (String(user.id) !== String(resourceOwnerId)) {
    return res.status(403).json({
      success: false,
      error: "Forbidden – you can only access your own resources",
    });
  }

  next();
}

module.exports = { requirePermission, requireOwnership };
