// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// ✅ Submit review
router.post('/submit-review', reviewController.submitReview);

// ✅ Admin route to view all reviews
router.get('/admin/reviewMaster', reviewController.getAllReviews);

// ✅ Route for deleting a review
router.post('/admin/reviews/delete/:rev_id', reviewController.deleteReview);

// // ✅ General user reviews (optional)
 router.get('/reviewMaster', reviewController.getAllReviews);

module.exports = router;
