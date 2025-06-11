// controllers/userController.js

// Dummy register handler (replace later with full logic)
exports.register = (req, res) => {
  console.log("Registering user");
  res.send("User registered");
};

// Dummy login handler (replace later with full logic)
exports.login = (req, res) => {
  console.log("Logging in user");
  res.send("User logged in");
};

// User dashboard
exports.showDashboard = (req, res) => {
  const user = req.session.user;

  if (!user || user.type !== 'user') {
    return res.redirect('/login');
  }

  res.render('userDashboard', { user }); // userDashboard.ejs must exist in /views
};
