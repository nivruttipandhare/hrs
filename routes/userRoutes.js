const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register page (GET)
router.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// Register form submission (POST)
router.post('/register', authController.register);

// Login page (GET)
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

router.get('/user/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('userDashboard', { user: req.session.user });
});



// Logout route (optional)
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
