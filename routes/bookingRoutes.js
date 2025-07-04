// routes/bookingRoutes.js
const express = require('express');
const router  = express.Router();

const bookingController = require('../controllers/bookingController');

/*  CREATE  →  POST /api/bookings            */
router.post('/api/bookings', bookingController.createBooking);

/*  UPDATE  →  PUT  /api/bookings/:id        */
// GET /admin/bookings/:id/edit → Render edit form
router.get('/admin/bookings/:id/edit', bookingController.renderEditBookingForm);


// DELETE /admin/bookings/:id
router.delete('/admin/bookings/:id', bookingController.deleteBooking);
router.get('/bookings/:id/edit', bookingController.renderEditBookingForm);

router.put('/api/bookings/:id', bookingController.updateBooking);
router.put('/admin/bookings/:id', bookingController.updateBooking);
router.put('/api/bookings/:id', bookingController.updateBooking);


module.exports = router;
