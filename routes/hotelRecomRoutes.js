const express = require('express');
const router = express.Router();
const hotelRecomController = require('../controllers/hotelRecomController');

// Middleware to protect routes
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/hotelRecom', isLoggedIn, hotelRecomController.getRecommendations);

module.exports = router;
