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


/* ---------------------------------------------------- */
/* UPDATE  →  PUT /api/bookings/:id                     */
// GET /admin/bookings/:id/edit
exports.renderEditBookingForm = (req, res) => {
  const id = req.params.id;

  const sql = 'SELECT * FROM bookingmaster WHERE booking_id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error while fetching booking.');
    }
    if (results.length === 0) {
      return res.status(404).send('Booking not found');
    }

    res.render('admin/editBooking', { booking: results[0] }); // path: views/admin/editBooking.ejs
  });
};

exports.deleteBooking = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM bookingmaster WHERE booking_id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting booking');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Booking not found');
    }
    res.redirect('/admin/bookings'); // or your desired page
  });
};


exports.updateBooking = (req, res) => {
  const id = req.params.id;
  const {
    userid, hotel_id, booking_date, checkin_date,
    checkin_time, checkout_date, checkout_time
  } = req.body;

  const sql = `
    UPDATE bookingmaster SET
      userid = ?, hotel_id = ?, booking_date = ?, checkin_date = ?,
      checkin_time = ?, checkout_date = ?, checkout_time = ?
    WHERE booking_id = ?
  `;

  db.query(sql,
    [userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time, id],
    (err, result) => {
      if (err) return res.status(500).send('Error updating');
      res.redirect('/admin/bookings'); // Or wherever you want to go
    }
  );
};
