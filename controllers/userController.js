// ============================
// Hotel Details Page
// ============================
  const db=require("../config/db");
exports.hotelDetails = (req, res) => {
  const hotelId = req.params.hotel_id;

  const query = `
    SELECT h.*, c.city_name, a.area_name,
           GROUP_CONCAT(DISTINCT am.amenity_name) AS amenities,
           GROUP_CONCAT(DISTINCT r.room_type) AS room_types
    FROM hotelmaster h
    JOIN citymaster c ON h.city_id = c.city_id
    JOIN areamaster a ON h.area_id = a.area_id
    LEFT JOIN hotelamenitiesjoin ha ON h.hotel_id = ha.hotel_id
    LEFT JOIN amenities am ON ha.amenity_id = am.amenity_id
    LEFT JOIN hotelroomjoin hr ON h.hotel_id = hr.hotel_id
    LEFT JOIN roomsmaster r ON hr.room_id = r.room_id
    WHERE h.hotel_id = ?
    GROUP BY h.hotel_id;
  `;

  db.query(query, [hotelId], (err, results) => {
    if (err) {
      console.error("Hotel details error:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      return res.status(404).send("Hotel not found");
    }

    res.render('user/hotelDetails', { hotel: results[0] }); // Make sure view exists
  });
};

// ============================
// Book Hotel Form Page
// ============================
exports.bookHotel = (req, res) => {
  const hotelId = req.params.hotel_id;

  db.query('SELECT * FROM hotelmaster WHERE hotel_id = ?', [hotelId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).send("Unable to load hotel");
    }

    res.render('user/bookHotel', { hotel: results[0] }); // Make sure view exists
  });
};

// ============================
// Book Hotel Form Submission
// ============================
exports.bookHotelSubmit = (req, res) => {
  const { hotel_id, checkin_date, checkout_date } = req.body;
  const userId = req.session.user?.userid;

  if (!userId) return res.redirect('/login');

  const query = `
    INSERT INTO bookingmaster (userid, hotel_id, checkin_date, checkout_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [userId, hotel_id, checkin_date, checkout_date], (err) => {
    if (err) {
      console.error("Booking error:", err);
      return res.status(500).send("Failed to book hotel");
    }

    res.redirect('/user/dashboard'); // Or show booking confirmation
  });
};

const { recommendHotelsByUser } = require('../services/hotelRecomServices');


exports.getRecommendedHotels = async (userId) => {
  return await recommendHotelsByUser(userId);
};
