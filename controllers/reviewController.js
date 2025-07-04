const db = require('../config/db');


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

exports.getReviews = (req, res) => {
  const sql = `
    SELECT u.username, h.hotel_name, r.*
    FROM   hotelreviewjoin hrj
    JOIN   usermaster   u ON u.userid   = hrj.userid
    JOIN   hotelmaster  h ON h.hotel_id = hrj.hotel_id
    JOIN   reviewmaster r ON r.rev_id   = hrj.rev_id
    ORDER  BY r.rev_date DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, reviews: rows });
  });
};


/* ───────────────── 2. ADMIN DASHBOARD WITH USERNAME ───────────────── */
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
// controllers/reviewController.js


/* --------------------------------------------------------
   DELETE  →  DELETE /admin/reviewMaster/:id
-------------------------------------------------------- */
exports.deleteReview = (req, res) => {
  const id = req.params.id;
  console.log('[DEBUG] deleteReview → rev_id:', id);

  const sql = 'DELETE FROM reviewmaster WHERE rev_id = ?'; // change rev_id if needed

  db.query(sql, [id], (err, result) => {
    /* 1. SQL error */
    if (err) {
      console.error('❌ SQL error deleting review:', err);
      return res.status(500).send('Internal Server Error');
    }

    /* 2. Row not found */
    if (result.affectedRows === 0) {
      return res.status(404).send('Review not found');
    }

    /* 3. Success */
    res.redirect('/admin/reviewMaster'); // or res.json({ message: 'Deleted' });
  });
};
