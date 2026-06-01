const jwt = require('jsonwebtoken');

/**
 * Middleware: Protects routes by verifying JWT token
 * Injects user data from token into req.user
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, username, email, role
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = { protect };
