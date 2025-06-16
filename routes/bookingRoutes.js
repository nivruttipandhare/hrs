const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bookingController = require('../controllers/bookingController');
router.post('/', bookingController.createBooking);
// Insert booking data
router.post('/book', (req, res) => {
  const { userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time } = req.body;

  const sql = `INSERT INTO bookingmaster 
    (userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time], (err, result) => {
    if (err) {
      console.error("Booking Insert Error:", err);
      return res.status(500).json({ message: "Booking failed" });
    }
    res.status(200).json({ message: "Booking successful!" });
  });
});

module.exports = router;
