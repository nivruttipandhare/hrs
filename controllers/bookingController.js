const db = require('../config/db');


exports.createBooking = (req, res) => {
    
  const {
    userid,
    hotel_id,
    booking_date,
    checkin_date,
    checkin_time,
    checkout_date,
    checkout_time
  } = req.body;

  const sql = `
    INSERT INTO bookingmaster 
    (userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error while booking' });
      }
      res.json({ message: 'Booking successful', booking_id: result.insertId });
    });
};
