// controllers/reviewController.js
const db = require('../config/db');

// ✅ Submit review
exports.submitReview = (req, res) => {
  const { rev_text, rating, rev_date } = req.body;

  const sql = `INSERT INTO reviewmaster (rev_text, rating, rev_date) VALUES (?, ?, ?)`;
  db.query(sql, [rev_text, rating, rev_date], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err);
      return res.status(500).json({ success: false });
    }
    console.log("✅ Review inserted");
    res.json({ success: true });
  });
};

// ✅ Get all reviews and render admin view
exports.getAllReviews = (req, res) => {
  const sql = "SELECT * FROM reviewmaster ORDER BY rev_date DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching reviews:", err);
      return res.status(500).send("Database error");
    }

    console.log("✅ Reviews fetched:", results);
   res.render('admin/reviewMaster', { reviews: results });
  });
};

// ✅ Delete review
exports.deleteReview = (req, res) => {
  const { rev_id } = req.params;

  db.query('DELETE FROM reviewmaster WHERE rev_id = ?', [rev_id], (err) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res.status(500).send("Delete failed");
    }
    console.log("✅ Review deleted:", rev_id);
    res.redirect('/admin/reviewMaster');  // ✅ Fix: added leading slash
  });
};

