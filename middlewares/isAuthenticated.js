// middlewares/isAuthenticated.js

module.exports = function isAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.userid) {
    return next();
  }

  const isAjaxRequest =
    req.xhr || (req.headers.accept && req.headers.accept.includes('json'));

  if (isAjaxRequest) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: Please log in.' });
  } else {
    req.session.redirectTo = req.originalUrl;
    return res.redirect('/login');
  }
};
