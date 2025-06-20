// controllers/reviewController.js
const db = require('../config/db');

// ✅ POST: Submit Review
exports.submitReview = (req, res) => {
  const { rev_text, rating, rev_date } = req.body;

  const sql = `INSERT INTO reviewmaster (rev_text, rating, rev_date) VALUES (?, ?, ?)`;
  db.query(sql, [rev_text, rating, rev_date], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err);
      return res.status(500).json({ success: false });
    }
    console.log("✅ Review inserted successfully");
    res.json({ success: true });
  });
};

exports.getAllReviews = (req, res) => {
  const sql = `SELECT * FROM reviewmaster ORDER BY rev_date DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch Error:", err);
      return res.status(500).send("Database error");
    }

    console.log("✅ Reviews fetched:", results); // ✅ This must show array
    res.render('admin/allReviews', { reviews: results });
  });
};



exports.getAllReviews = (req, res) => {
  const sql = "SELECT * FROM reviewmaster ORDER BY rev_date DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching reviews:", err);
      return res.status(500).send("Database error");
    }

    console.log("✅ Reviews fetched:", results);  // Optional log
    res.render('admin/allReviews', { reviews: results });
  });
};