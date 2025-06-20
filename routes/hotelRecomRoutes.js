// routes/hotelRecomRoutes.js
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/authMiddleware');
const hotelRecomController = require('../controllers/hotelRecomController');

// Session-based protected route
router.get('/user/hotelRecom', isLoggedIn, hotelRecomController.getRecommendations);

module.exports = router;
