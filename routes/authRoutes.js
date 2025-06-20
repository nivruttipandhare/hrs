



// ===== 📁 routes/authRoutes.js =====
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', (req, res) => res.render('register', { message: null }));
router.post('/register', authController.register);

router.get('/login', (req, res) => res.render('login', { message: null }));
router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.redirect('/login');
  });
});

module.exports = router;

