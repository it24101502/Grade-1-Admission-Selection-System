// src/server/middleware/categoryGuard.js
const { CATEGORIES } = require("../data/seed");

function categoryGuard(req, res, next) {
  const { user } = req;

  if (user.category === CATEGORIES.ADMIN) {
    req.resolvedCategory = req.query.category || null;
    return next();
  }

  const requested = req.query.category;
  if (requested && requested !== user.category) {
    return res.status(403).json({
      error: "Access denied. You cannot view applications outside your category.",
    });
  }

  req.resolvedCategory = user.category;
  next();
}

module.exports = { categoryGuard };
