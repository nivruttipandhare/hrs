const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register page
router.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// Register logic
router.post('/register', authController.register);

// Login page
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// Login logic
router.post('/login', authController.login);

// User Dashboard Route
// router.get('/user/dashboard', (req, res) => {
//   const user = req.session.user;
//   res.render('userDashboard', { user: user });
// });

module.exports = router;
