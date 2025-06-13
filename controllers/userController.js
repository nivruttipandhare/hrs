// controllers/userController.js

// Dummy register handler (replace later with full logic)
exports.register = (req, res) => {
  console.log("Registering user");
  res.send("User registered");
};

// Dummy login handler (replace later with full logic)
exports.login = (req, res) => {
  console.log("Logging in user");
  res.send("User logged in");
};

// User dashboard
exports.showDashboard = (req, res) => {
  const user = req.session.user;

  if (!user || user.type !== 'user') {
    return res.redirect('/login');
  }

  res.render('userDashboard', { user }); // userDashboard.ejs must exist in /views
};

const db = require('../config/db');

// ==================== USER PROFILE ====================

// Get user profile
exports.getUserProfile = (req, res) => {
  const userId = req.user.userid;

  const query = `SELECT userid, username, useremail, contact, type FROM usermaster WHERE userid = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
};

// Update user profile
exports.updateUserProfile = (req, res) => {
  const userId = req.user.userid;
  const { username, useremail, contact } = req.body;

  const query = `
      UPDATE usermaster 
      SET username = ?, useremail = ?, contact = ? 
      WHERE userid = ?
  `;

  db.query(query, [username, useremail, contact, userId], (err, result) => {
    if (err) {
      console.error("Error updating user profile:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json({ message: "Profile updated successfully" });
  });
};

// ==================== HOTEL SEARCH ====================

exports.searchHotels = (req, res) => {
  const { hotel_name, city_name, area_name } = req.query;

  const query = `
      SELECT 
          h.hotel_id, h.hotel_name, h.hotel_address, h.rating, h.reviewcount, 
          c.city_name, a.area_name, MAX(p.filename) AS filename
      FROM hotelmaster h
      JOIN citymaster c ON h.city_id = c.city_id
      JOIN areamaster a ON h.area_id = a.area_id
      LEFT JOIN hotelpicjoin p ON h.hotel_id = p.hotel_id
      WHERE 
          (? IS NULL OR h.hotel_name LIKE CONCAT('%', ?, '%'))
          AND (? IS NULL OR c.city_name LIKE CONCAT('%', ?, '%'))
          AND (? IS NULL OR a.area_name LIKE CONCAT('%', ?, '%'))
      GROUP BY h.hotel_id
  `;

  db.query(query, [
      hotel_name || null, hotel_name || '',
      city_name || null, city_name || '',
      area_name || null, area_name || ''
  ], (err, results) => {
      if (err) {
          console.error("Error searching hotels:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json(results);
  });
};

// ==================== HOTEL LIST & DETAILS ====================

// Get all hotels
exports.getAllHotels = (req, res) => {
  const query = `
      SELECT 
          h.hotel_id, h.hotel_name, h.hotel_address, h.rating, h.reviewcount, 
          c.city_name, a.area_name, MAX(p.filename) AS filename
      FROM hotelmaster h
      JOIN citymaster c ON h.city_id = c.city_id
      JOIN areamaster a ON h.area_id = a.area_id
      LEFT JOIN hotelpicjoin p ON h.hotel_id = p.hotel_id
      GROUP BY h.hotel_id
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching hotels:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json(results);
  });
};

// Get hotel by ID
exports.getHotelById = (req, res) => {
  const hotelId = req.params.id;

  const query = `
      SELECT 
          h.hotel_id, h.hotel_name, h.hotel_address, h.rating, h.reviewcount, 
          c.city_name, a.area_name, MAX(p.filename) AS filename
      FROM hotelmaster h
      JOIN citymaster c ON h.city_id = c.city_id
      JOIN areamaster a ON h.area_id = a.area_id
      LEFT JOIN hotelpicjoin p ON h.hotel_id = p.hotel_id
      WHERE h.hotel_id = ?
      GROUP BY h.hotel_id
  `;

  db.query(query, [hotelId], (err, results) => {
      if (err) {
          console.error("Error fetching hotel:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(results[0]);
  });
};

// ==================== BOOKING ====================

// Add Booking
exports.addBooking = (req, res) => {
  const { userid, hotel_id, checkin_date, checkin_time, checkout_date, checkout_time } = req.body;

  const query = `
      INSERT INTO bookingmaster 
      (userid, hotel_id, booking_date, checkin_date, checkin_time, checkout_date, checkout_time) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?)
  `;

  db.query(query, [userid, hotel_id, checkin_date, checkin_time, checkout_date, checkout_time], (err, result) => {
      if (err) {
          console.error("Error inserting booking:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ message: "Booking successful!", booking_id: result.insertId });
  });
};

// Get bookings by user
exports.getBookingsByUser = (req, res) => {
  const { userid } = req.params;

  const query = `
      SELECT 
          b.booking_id, h.hotel_name, h.hotel_address, b.checkin_date, b.checkin_time, b.checkout_date, b.checkout_time
      FROM bookingmaster b
      JOIN hotelmaster h ON b.hotel_id = h.hotel_id
      WHERE b.userid = ?
  `;

  db.query(query, [userid], (err, results) => {
      if (err) {
          console.error("Error fetching bookings:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json(results);
  });
};

// Cancel booking (mark as cancelled)
exports.cancelBooking = (req, res) => {
  const bookingId = req.params.bookingId;

  const query = `
      UPDATE bookingmaster
      SET booking_status = 'Cancelled'
      WHERE booking_id = ?
  `;

  db.query(query, [bookingId], (err, result) => {
      if (err) {
          console.error("Error cancelling booking:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking cancelled successfully" });
  });
};
