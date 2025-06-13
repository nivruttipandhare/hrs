// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Login Page
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// Login Logic
router.post('/login', (req, res) => {
  const { useremail, password } = req.body;

  const sql = 'SELECT * FROM usermaster WHERE useremail = ?';
  db.query(sql, [useremail], async (err, results) => {
    if (err) return res.render('login', { message: 'Database error' });
    if (results.length === 0) return res.render('login', { message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.render('login', { message: 'Incorrect password' });

    req.session.user = {
      id: user.id,
      username: user.username,
      type: user.type, // 'admin' or 'user'
    };

    // Redirect based on role
    if (user.type === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/user/dashboard');
    }
  });
});

// ✅ Optional (Only if you want to include it here, not recommended in large apps)
router.get('/user/dashboard', (req, res) => {
  const user = req.session.user;
  if (!user || user.type !== 'user') {
    return res.redirect('/login');
  }

  res.render('userDashboard', { user });
});


router.get('/dashboard', (req, res) => {
  res.render('userDashboard', { user: req.session.user });
});


module.exports = router;
