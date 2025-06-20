// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// ✅ Submit a review (POST)
router.post('/submit-review', reviewController.submitReview);

// ✅ Get all reviews (GET)
router.get('/reviews', reviewController.getAllReviews);





// GET All Reviews
router.get('/admin/allReviews', reviewController.getAllReviews);


module.exports = router;
router.post('/admin/reviews/delete/:rev_id', (req, res) => {
  const { rev_id } = req.params;

  db.query('DELETE FROM reviewmaster WHERE rev_id = ?', [rev_id], (err) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res.status(500).send("Delete failed");
    }
    res.redirect('/admin/allReviews');
  });
});
