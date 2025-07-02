function isLoggedIn(req, res, next) {
  if (req.session && req.session.user && req.session.user.userid) {
    return next();
  } else {
    req.session.redirectTo = req.originalUrl; // Save route before redirect
    return res.redirect('/login');
  }
}

module.exports = { isLoggedIn };
