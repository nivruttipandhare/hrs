const express = require('express');
const router = express.Router();
const { recommendHotelsByUser } = require('../services/hotelRecomServices');
const db = require('../config/db');
const isLoggedIn = require('../middlewares/authMiddleware');

// Function to get all hotels (uses Promises)
function getHotels() {
  return db.promise().query('SELECT * FROM hotelmaster')
    .then(([rows]) => rows);
}

// Route without async/await
router.get('/user/dashboard', isLoggedIn, (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  getHotels()
    .then(hotels => {
      return recommendHotelsByUser(user.userid)
        .then(recommendations => {
          res.render('userDashboard', {
            user,
            hotels,
            recommendations,
            bookings: [],
            error: null
          });
        });
    })
    .catch(err => {
      console.error("❌ Error in /user/dashboard:", err);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
