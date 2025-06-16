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

// Login logic
router.post('/register', authController.register);
router.post('/login', authController.login);


module.exports = router;
