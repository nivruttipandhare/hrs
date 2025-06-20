const db = require('../config/db');

// ================================
// 1. USER DASHBOARD - View Hotels + Amenities
// ================================
const getUserDashboard = (req, res) => {
  const user = req.session.user || null;

  db.query(`
    SELECT h.hotel_id, h.hotel_name, h.hotel_image, h.hotel_email,
           h.hotel_contact, h.rating, h.reviewcount,
           c.city_name, a.area_name
    FROM hotelmaster h
    JOIN citymaster c ON h.city_id = c.city_id
    JOIN areamaster a ON h.area_id = a.area_id
  `, (err, hotels) => {
    if (err) {
      console.error('Hotel Query Error:', err);
      return res.render('userDashboard', {
        user,
        hotels: [],
        bookings: [],
        bookingError: 'Error loading hotels'
      });
    }

    db.query(`
      SELECT haj.hotel_id, a.amenity_name
      FROM hotelamenitiesjoin haj
      JOIN amenities a ON haj.amenity_id = a.amenity_id
    `, (err, amenities) => {
      if (err) {
        console.error('Amenity Query Error:', err);
        return res.render('userDashboard', {
          user,
          hotels,
          bookings: [],
          bookingError: 'Error loading amenities'
        });
      }

      const hotelsWithAmenities = hotels.map(hotel => ({
        ...hotel,
        amenities: amenities
          .filter(a => a.hotel_id === hotel.hotel_id)
          .map(a => a.amenity_name)
      }));

      res.render('userDashboard', {
        user,
        hotels: hotelsWithAmenities,
        bookings: [],
        bookingError: null
      });
    });
  });
};

// ================================
// 2. BOOK HOTEL
// ================================
const bookHotel = (req, res) => {
  const user = req.session.user;
  if (!user || !user.userid) {
    console.log("No user in session!", req.session.user);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const {
    hotel_id, checkin_date, checkin_time,
    checkout_date, checkout_time
  } = req.body;

  if (!hotel_id || !checkin_date || !checkout_date) {
    return res.status(400).json({ success: false, message: 'Required fields missing.' });
  }

  const bookingDate = new Date().toISOString().slice(0, 10);

  const insertQuery = `
    INSERT INTO bookingmaster (
      userid, hotel_id, booking_date,
      checkin_date, checkin_time, checkout_date, checkout_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user.userid,
    hotel_id,
    bookingDate,
    checkin_date,
    checkin_time || '14:00:00',
    checkout_date,
    checkout_time || '11:00:00'
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Booking Insert Error:', err);
      return res.status(500).json({ success: false, message: 'Booking failed' });
    }

    res.json({ success: true, message: 'Hotel booked successfully!', bookingId: result.insertId });
  });
};

// ================================
// 3. GET HOTEL DETAILS (for Modal)
// ================================
const getHotelDetails = (req, res) => {
  const hotelId = req.params.hotelId;
  if (!hotelId) {
    return res.status(400).json({ success: false, message: 'Hotel ID is required.' });
  }

  db.query(`
    SELECT h.hotel_id, h.hotel_name, h.hotel_image, h.hotel_email,
           h.hotel_contact, h.rating, h.reviewcount,
           c.city_name, a.area_name
    FROM hotelmaster h
    JOIN citymaster c ON h.city_id = c.city_id
    JOIN areamaster a ON h.area_id = a.area_id
    WHERE h.hotel_id = ?
  `, [hotelId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ success: false, message: 'Hotel not found or query error.' });
    }

    const hotel = results[0];

    db.query(`
      SELECT a.amenity_name
      FROM hotelamenitiesjoin haj
      JOIN amenities a ON haj.amenity_id = a.amenity_id
      WHERE haj.hotel_id = ?
    `, [hotelId], (err, amenities) => {
      if (err) {
        return res.json({ success: true, hotel, amenities: [] });
      }

      const amenitiesList = amenities.map(a => a.amenity_name);
      res.json({ success: true, hotel, amenities: amenitiesList });
    });
  });
};

// ================================
// 4. VALIDATE USERNAME (AJAX)
// ================================
const validateUsername = (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Username is required.' });

  db.query('SELECT username FROM usermaster WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Username validation error:', err);
      return res.status(500).json({ success: false, message: 'Error validating username.' });
    }

    res.json({
      success: results.length > 0,
      message: results.length > 0 ? 'Username exists.' : 'Username not found.'
    });
  });
};

// ================================
// 5. ADMIN: VIEW ALL BOOKINGS
// ================================
const getAllBookings = (req, res) => {
  db.query(`
    SELECT b.booking_id, u.username, h.hotel_name, h.hotel_image,
           b.booking_date, b.checkin_date, b.checkout_date,
           b.checkin_time, b.checkout_time
    FROM bookingmaster b
    JOIN usermaster u ON b.userid = u.userid
    JOIN hotelmaster h ON b.hotel_id = h.hotel_id
  `, (err, bookings) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.render('admin/bookingMaster', {
        user: req.session.user,
        bookings: [],
        error: 'Error loading bookings'
      });
    }

    res.render('admin/bookingMaster', {
      user: req.session.user,
      bookings,
      error: null,
      activePage: 'bookings'
    });
  });
};

// ================================
// 6. ADMIN: EDIT BOOKING FORM
// ================================
const editBookingForm = (req, res) => {
  const bookingId = req.params.bookingId;
  db.query('SELECT * FROM bookingmaster WHERE booking_id = ?', [bookingId], (err, results) => {
    if (err || results.length === 0) {
      return res.redirect('/admin/bookings');
    }

    // ✅ Only ONE res.render call
    res.render('admin/editBooking', {
      booking: results[0],
      user: req.session.user, // ✅ required for adminDashboard.ejs
    });
  });
};


// ================================
// 7. ADMIN: UPDATE BOOKING
// ================================
const updateBooking = (req, res) => {
  const bookingId = req.params.bookingId;
  const { checkin_date, checkin_time, checkout_date, checkout_time } = req.body;

  const updateQuery = `
    UPDATE bookingmaster
    SET checkin_date = ?, checkin_time = ?, checkout_date = ?, checkout_time = ?
    WHERE booking_id = ?
  `;

  const values = [checkin_date, checkin_time, checkout_date, checkout_time, bookingId];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error("❌ Booking update failed:", err);
      return res.status(500).send("Update failed");
    }

    console.log("✅ Booking updated successfully");
    res.redirect("/admin/bookings"); // ✅ make sure this route exists
  });
};

// ================================
// 8. ADMIN: DELETE BOOKING
// ================================
const deleteBooking = (req, res) => {
  const bookingId = req.params.bookingId;
  db.query('DELETE FROM bookingmaster WHERE booking_id = ?', [bookingId], (err) => {
    if (err) {
      console.error('Delete Error:', err);
      return res.status(500).send('Delete failed');
    }
    res.redirect('/admin/bookings');
  });
};

// ================================
// EXPORT FUNCTIONS
// ================================
module.exports = {
  getUserDashboard,
  bookHotel,
  getHotelDetails,
  validateUsername,
  getAllBookings,
  editBookingForm,
  updateBooking,
  deleteBooking
};
