const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const hotelController = require('../controllers/hotelController'); // ✅ Import this
const userController = require('../controllers/userController');   // ✅ Import this

// Register page
router.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// Register form submission
router.post('/register', authController.register);

// Login page
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// Login form submission
router.post('/login', authController.login);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect('/login');
  });
});

// ✅ User Dashboard with Hotel List and Recommendations
router.get('/user/dashboard', async (req, res) => {
  const user = req.session.user;

  if (!user) return res.redirect('/login');

  try {
    const hotels = await hotelController.getAllHotels(); // ✅ Replace with your real method
    const recommendations = await userController.getRecommendedHotels(user.userid); // ✅ Replace with your real method

    res.render('userDashboard', {
      user,
      hotels,
      recommendations,
      bookings: [],
      error: req.flash ? req.flash('error') : null
    });

  } catch (error) {
    console.error("Dashboard load error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
