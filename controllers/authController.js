const bcrypt = require('bcrypt');
const db = require('../config/db');

// ✅ Register Controller (Callback-based)
exports.register = (req, res) => {
  const { username, useremail, password, contact, type } = req.body;

  // 1. Check if email already exists
  db.query('SELECT * FROM usermaster WHERE useremail = ?', [useremail], (err, existingUser) => {
    if (err) {
      console.error("❌ Error checking user:", err);
      return res.render('register', { message: '❌ Registration failed. Try again.' });
    }

    if (existingUser.length > 0) {
      return res.render('register', { message: '❌ Email already registered' });
    }

    // 2. Hash password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("❌ Bcrypt error:", hashErr);
        return res.render('register', { message: '❌ Registration failed. Try again.' });
      }

      // 3. Insert user
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
// ✅ Login Controller (Callback-based)
exports.login = (req, res) => {
  const { useremail, password, type } = req.body;

  // 1. Check if user exists
  db.query('SELECT * FROM usermaster WHERE useremail = ?', [useremail], (err, results) => {
    if (err) {
      console.error("❌ Login DB error:", err);
      return res.render('login', { message: '❌ Login failed. Try again.' });
    }

    const user = results[0];
    if (!user) {
      return res.render('login', { message: '❌ User not found' });
    }

    // 2. Compare password
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("❌ Bcrypt error:", compareErr);
        return res.render('login', { message: '❌ Login failed. Try again.' });
      }

      if (!isMatch) {
        return res.render('login', { message: '❌ Incorrect password' });
      }

      // 3. Check admin role
      const allowedAdmins = ['admin1@gmail.com', 'admin2@gmail.com'];
      if (type === 'admin' && !allowedAdmins.includes(user.useremail)) {
        return res.render('login', { message: '❌ Not authorized as admin' });
      }

      // 4. Set session
      req.session.user = {
        id: user.userid,
        username: user.username,
        type: user.type,
      };

      // 5. Redirect
      if (user.type === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/user/dashboard');
      }
    });
  });
};
