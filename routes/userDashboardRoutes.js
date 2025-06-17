const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');

// GET: User Dashboard - List Hotels + Amenities
router.get('/user/dashboard', userDashboardController.getUserDashboard);

// GET: API - Hotel Details by ID (used for AJAX modal or API)
router.get('/user/hotel/:hotelId', userDashboardController.getHotelDetails);

// POST: Book a Hotel
router.post('/book', userDashboardController.bookHotel);

module.exports = router;
