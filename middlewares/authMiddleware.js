// ===== 📁 middlewares/authMiddleware.js =====
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.type === 'admin') return next();
  res.status(403).render('unauthorized', { message: 'Admins only!' });
};
