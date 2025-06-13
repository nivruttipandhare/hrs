exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.type === 'admin') {
    return next();
  }
  res.status(403).render('unauthorized', { message: 'Admins only!' });
};

const jwt = require('jsonwebtoken');

// Secret key (same you used while generating token)
const secretKey = 'your_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
