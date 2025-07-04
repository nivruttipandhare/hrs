const express = require('express');
const router  = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../controllers/authController');

/* ---------- USER API ROUTES ---------- */
router.post('/api/submit-review', isAuthenticated, reviewController.submitReview);
router.get('/api/reviews', isAuthenticated, reviewController.getReviews);

/* ---------- ADMIN DASHBOARD ROUTES ---------- */
router.get('/admin/reviewMaster', reviewController.getAllReviews);

// Method-override based delete (for DELETE via form)
router.delete('/admin/reviewMaster/:id', reviewController.deleteReview);

// Optional: for POST-based delete without method override
router.post('/admin/reviews/delete/:id', reviewController.deleteReview);



//
router.post('/submit-review', reviewController.submitReview);

// ✅ Admin route to view all reviews
router.get('/admin/reviewMaster', reviewController.getAllReviews);

// ✅ Route for deleting a review
router.post('/admin/reviews/delete/:rev_id', reviewController.deleteReview);

// // ✅ General user reviews (optional)
 router.get('/reviewMaster', reviewController.getAllReviews);
module.exports = router;
//



