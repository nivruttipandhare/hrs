// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// ✅ SESSION Middleware
function isLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    req.session.redirectTo = req.originalUrl;
    return res.redirect('/login');
  }
}

// ✅ JWT Middleware using Promise + async/await style
function verifyToken(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

  verifyToken(token, secretKey)
    .then(decoded => {
      req.user = decoded;
      next();
    })
    .catch(() => {
      res.status(403).json({ message: 'Invalid Token.' });
    });
};

// ✅ EXPORT BOTH
module.exports = {
  isLoggedIn,
  authMiddleware
};
