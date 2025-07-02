const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../middlewares/authMiddleware');
const hotelRecomController = require('../controllers/hotelRecomController');
const userController = require('../controllers/userController'); // ✅ Import

// 🔹 Hotel Recommendations
router.get('/user/hotelRecom', isLoggedIn, hotelRecomController.getRecommendations);

// 🔹 Hotel Details page
router.get('/user/hotelDetails/:hotel_id', isLoggedIn, userController.hotelDetails);

// 🔹 Book Hotel form page
router.get('/user/bookHotel/:hotel_id', isLoggedIn, userController.bookHotel);

// 🔹 Book Hotel submission (POST)
router.post('/user/bookHotel', isLoggedIn, userController.bookHotelSubmit);

module.exports = router;
