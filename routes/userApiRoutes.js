const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Hotels
router.get('/hotels', userController.getAllHotels);
router.get('/hotels/:id', userController.getHotelById);
router.get('/search', userController.searchHotels);

// Bookings
router.post('/bookings', userController.addBooking);
router.get('/bookings/:userid', userController.getBookingsByUser);
router.delete('/bookings/:booking_id', userController.cancelBooking);

// Profile
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

module.exports = router;
