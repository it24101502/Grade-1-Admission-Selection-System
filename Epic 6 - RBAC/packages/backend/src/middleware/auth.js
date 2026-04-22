const jwt = require("jsonwebtoken");
const { PERMISSIONS, CATEGORY_RESTRICTED_ROLES } = require("../../../../shared/index.cjs");

// Scrum-25: Middleware to validate JWT and attach user to request
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Scrum-25: Role-permission check middleware (factory)
function requirePermission(permission) {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Your role (${req.user.role}) does not have permission: ${permission}`,
      });
    }
    next();
  };
}

// Scrum-28: Role-based guard (factory)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `This endpoint requires one of: ${roles.join(", ")}`,
      });
    }
    next();
  };
}

// Scrum-26: Category filter — parents only see their own category
function filterByCategory(req, res, next) {
  if (CATEGORY_RESTRICTED_ROLES.includes(req.user.role)) {
    req.categoryFilter = req.user.category;
  } else {
    req.categoryFilter = null; // no restriction
  }
  next();
}

module.exports = { authenticate, requirePermission, requireRole, filterByCategory };
