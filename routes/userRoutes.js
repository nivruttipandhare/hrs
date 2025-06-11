const express = require('express');
const router = express.Router();

// ✅ FIX THIS LINE
const authController = require('../controllers/authController'); // NOT './authController.js()' or wrong path

router.get('/register', (req, res) => {
    res.render('register');   // this will render register.ejs
});


router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('userDashboard', { user: req.session.user });
});

module.exports = router;
