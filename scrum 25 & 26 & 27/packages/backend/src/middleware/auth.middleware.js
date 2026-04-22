const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-prod";

/**
 * Attach decoded user to req.user.
 * Returns 401 if token is missing/invalid.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    req.user = user; // { id, role, email, iat, exp }
    next();
  });
}

/**
 * Helper used in tests / auth route to sign tokens.
 */
function signToken(payload, expiresIn = "8h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { authenticateToken, signToken };
