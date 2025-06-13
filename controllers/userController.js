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


const db = require('../config/db');

exports.login = async (req, res) => {
  const { useremail, password } = req.body;

  try {
    const [user] = await db.query('SELECT * FROM usermaster WHERE useremail = ? AND password = ?', [useremail, password]);

    if (user.length === 0) {
      return res.render('login', { message: 'Invalid email or password' });
    }

    // Set session
    req.session.user = {
      id: user[0].userid,
      name: user[0].username,
      type: user[0].usertype // e.g., 'admin' or 'user'
    };

    // Redirect based on type
    if (user[0].usertype === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/user/dashboard');
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Internal Server Error");
  }
};
