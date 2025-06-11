const express = require('express');
const router = express.Router();
const db = require('../db'); // your DB connection, adjust if path differs

router.get('/dashboard', async (req, res) => {
  try {
    // Fetch total users and hotels from DB
    const [userResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM usermaster');
    const [hotelResult] = await db.query('SELECT COUNT(*) AS totalHotels FROM hotelmaster');

    const dashboardStats = {
      totalUsers: userResult[0].totalUsers,
      totalHotels: hotelResult[0].totalHotels,
    };

    res.render('adminDashboard', { dashboardStats }); // ✅ pass to EJS
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Dashboard loading failed');
  }
});

module.exports = router;
