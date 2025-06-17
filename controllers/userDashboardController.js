// controllers/userDashboardController.js
const db = require('../config/db');

const userDashboardController = {
  getUserDashboard: (req, res) => {
    // Fetch hotels with city and area details
    db.query(`
      SELECT 
        h.hotel_id, h.hotel_name, h.hotel_image, h.hotel_email, h.hotel_contact,
        h.rating, h.reviewcount, h.description, c.city_name, a.area_name
      FROM hotelmaster h
      JOIN cities c ON h.city_id = c.city_id
      JOIN areas a ON h.area_id = a.area_id
    `, (err, hotels) => {
      if (err) {
        console.error('❌ Database Error:', err);
        return res.render('userDashboard', {
          user: req.session.user || null,
          hotels: [],
          error: 'Error loading hotels. Please try again later.'
        });
      }

      // Fetch amenities
      db.query(`
        SELECT haj.hotel_id, a.amenity_name
        FROM hotelamenitiesjoin haj
        JOIN amenities a ON haj.amenity_id = a.amenity_id
      `, (err, amenities) => {
        if (err) {
          console.error('❌ Database Error:', err);
          return res.render('userDashboard', {
            user: req.session.user || null,
            hotels: [],
            error: 'Error loading amenities. Please try again later.'
          });
        }

        // Map amenities to hotels
        const hotelsWithAmenities = hotels.map(hotel => ({
          ...hotel,
          amenities: amenities.filter(a => a.hotel_id === hotel.hotel_id).map(a => a.amenity_name)
        }));

        console.log('Hotels fetched:', hotelsWithAmenities.length); // Debug log

        res.render('userDashboard', {
          user: req.session.user || null,
          hotels: hotelsWithAmenities,
          error: null
        });
      });
    });
  },

  getHotelDetails: (req, res) => {
    const { hotelId } = req.params;

    // Fetch hotel details
    db.query(`
      SELECT 
        h.hotel_id, h.hotel_name, h.hotel_image, h.hotel_email, h.hotel_contact,
        h.rating, h.reviewcount, h.description, c.city_name, a.area_name
      FROM hotelmaster h
      JOIN cities c ON h.city_id = c.city_id
      JOIN areas a ON h.area_id = a.area_id
      WHERE h.hotel_id = ?
    `, [hotelId], (err, hotels) => {
      if (err) {
        console.error('❌ Hotel Details Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (!hotels.length) {
        return res.status(404).json({ success: false, message: 'Hotel not found' });
      }

      // Fetch amenities for the hotel
      db.query(`
        SELECT a.amenity_name
        FROM hotelamenitiesjoin haj
        JOIN amenities a ON haj.amenity_id = a.amenity_id
        WHERE haj.hotel_id = ?
      `, [hotelId], (err, amenities) => {
        if (err) {
          console.error('❌ Hotel Details Error:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }

        res.json({
          success: true,
          hotel: { ...hotels[0], amenities: amenities.map(a => a.amenity_name) }
        });
      });
    });
  },

  bookHotel: (req, res) => {
    const { userid, hotel_id, hotel_name, booking_date, checkin_date, checkin_time, checkout_date, checkout_time } = req.body;

    if (!userid || !hotel_id || !hotel_name || !checkin_date || !checkin_time || !checkout_date || !checkout_time) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Insert booking into database
    db.query(`
      INSERT INTO bookingmaster (userid, hotel_id, hotel_name, booking_date, checkin_date, checkin_time, checkout_date, checkout_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userid, hotel_id, hotel_name, booking_date, checkin_date, checkin_time, checkout_date, checkout_time], (err, result) => {
      if (err) {
        console.error('❌ Booking Error:', err);
        return res.status(500).json({ success: false, message: 'Booking failed' });
      }

      res.json({ success: true, message: 'Booking confirmed', booking_id: result.insertId });
    });
  }
};



module.exports = userDashboardController;