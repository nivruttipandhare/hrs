const bcrypt = require('bcrypt');
const db = require('../config/db');

// ================================
// ✅ Register Controller
// ================================
exports.register = (req, res) => {
  const { username, useremail, password, contact, type } = req.body;

  db.query('SELECT * FROM usermaster WHERE useremail = ?', [useremail], (err, existingUser) => {
    if (err) {
      console.error("❌ Error checking user:", err);
      return res.render('register', { message: '❌ Registration failed. Try again.' });
    }

    if (existingUser.length > 0) {
      return res.render('register', { message: '❌ Email already registered' });
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("❌ Bcrypt error:", hashErr);
        return res.render('register', { message: '❌ Registration failed. Try again.' });
      }

      db.query(
        'INSERT INTO usermaster (username, useremail, password, contact, type) VALUES (?, ?, ?, ?, ?)',
        [username, useremail, hashedPassword, contact, type],
        (insertErr) => {
          if (insertErr) {
            console.error("❌ Insert error:", insertErr);
            return res.render('register', { message: '❌ Registration failed. Try again.' });
          }

          return res.render('register', { message: '✅ Registration successful! You can now login.' });
        }
      );
    });
  });
};

// ================================
// ✅ Login Controller
// ================================
exports.login = (req, res) => {
  const { useremail, password, type } = req.body;

  db.query('SELECT * FROM usermaster WHERE useremail = ?', [useremail], (err, results) => {
    if (err) {
      console.error("❌ Login DB error:", err);
      return res.render('login', { message: '❌ Login failed. Try again.' });
    }

    if (results.length === 0) {
      return res.render('login', { message: '❌ User not found' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("❌ Bcrypt error:", compareErr);
        return res.render('login', { message: '❌ Login failed. Try again.' });
      }

      if (!isMatch) {
        return res.render('login', { message: '❌ Incorrect password' });
      }

      const allowedAdmins = ['admin1@gmail.com', 'admin2@gmail.com'];
      if (type === 'admin' && !allowedAdmins.includes(user.useremail)) {
        return res.render('login', { message: '❌ Not authorized as admin' });
      }

      req.session.user = {
        userid: user.userid,
        username: user.username,
        type: user.type
      };

      if (user.type === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/user/dashboard');
      }
    });
  });
};

// ================================
// ✅ Logout Controller
// ================================
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.send("❌ Logout failed");
    }
    res.redirect('/login');
  });
};

// ================================
// ✅ Middleware (for route protection)
// ================================
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.type === 'admin') {
    return next();
  }
  res.status(403).send('Access denied');
};
