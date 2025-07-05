// routes/userRoutes.js
const express = require('express');
const router  = express.Router();

const authController  = require('../controllers/authController');
const hotelController = require('../controllers/hotelController');
const userController  = require('../controllers/userController');

/* ───────── PUBLIC AUTH ROUTES ───────── */
router.get('/register', (req, res) =>
  res.render('register', { message: null })
);
router.post('/register', authController.register);

router.get('/login', (req, res) =>
  res.render('login', { message: null })
);
router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login');
  });
});

/* ───────── UNIVERSAL DASHBOARD (/dashboard) ─────────
   Accessible to guests AND logged‑in users            */
router.get('/dashboard', async (req, res) => {
  const user   = req.session.user || null;               // may be null
  const hotels = await hotelController.getAllHotels();

  const recommendations = user
    ? await userController.getRecommendedHotels(user.userid)
    : [];

  res.render('userDashboard', {
    user,                 // null for guests; full object when logged in
    hotels,
    recommendations,
    bookings: [],         // fill later if you have bookings
    error: req.flash ? req.flash('error') : null
  });
});

/* ───────── OPTIONAL: STRICT PRIVATE DASHBOARD ─────────
   Keep only if you still want /user/dashboard to FORCE login.
   Otherwise delete this block entirely.                 */
router.get('/user/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  // Re‑use the universal handler logic by calling next route
  return res.redirect('/dashboard');
});

module.exports = router;
