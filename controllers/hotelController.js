const db = require('../config/db');  // your mysql connection pool

// Search Hotels API
exports.searchHotels = (req, res) => {
  const { hotelName, cityName } = req.query;

  let query = `
    SELECT h.hotel_id, h.hotel_name, h.hotel_address, h.rating, h.reviewcount, c.city_name
    FROM hotelmaster h
    JOIN citymaster c ON h.city_id = c.city_id
    WHERE 1=1
  `;

  let params = [];

  if (hotelName) {
    query += " AND h.hotel_name LIKE ?";
    params.push(`%${hotelName}%`);
  }

  if (cityName) {
    query += " AND c.city_name LIKE ?";
    params.push(`%${cityName}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error while searching hotels:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};
