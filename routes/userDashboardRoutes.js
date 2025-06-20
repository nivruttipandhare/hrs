const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');

// USER ROUTES
router.get('/user/dashboard', userDashboardController.getUserDashboard);
router.post('/book', userDashboardController.bookHotel);  // ✅ fixed here
router.get('/hotel/:hotelId', userDashboardController.getHotelDetails);
router.post('/validate-username', userDashboardController.validateUsername);

// ADMIN ROUTES
router.get('/admin/bookings', userDashboardController.getAllBookings);
router.get('/admin/bookings/edit/:bookingId', userDashboardController.editBookingForm);
router.post('/admin/bookings/edit/:bookingId', userDashboardController.updateBooking);
router.post('/admin/bookings/delete/:bookingId', userDashboardController.deleteBooking);

module.exports = router;
