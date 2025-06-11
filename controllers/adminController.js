exports.showDashboard = (req, res) => {
    const user = req.session.user;

    if (!user || user.usertype !== 'admin') {
        return res.redirect('/login');
    }

    // Sample dummy data just for now
    res.render('adminDashboard', {
        adminUser: user,
        dashboardStats: {
            totalUsers: 100,
            totalHotels: 50,
            totalBookings: 200,
            totalReviews: 150,
            pendingQueries: 10
        },
        users: [],
        hotels: []
    });
};

// controllers/adminController.js
exports.loadDashboard = async (req, res) => {
  try {
    // Example: Fetch data from database
    const [totalUsersResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM usermaster');
    const [totalHotelsResult] = await db.query('SELECT COUNT(*) AS totalHotels FROM hotelmaster');

    const dashboardStats = {
      totalUsers: totalUsersResult[0].totalUsers,
      totalHotels: totalHotelsResult[0].totalHotels,
    };

    res.render('adminDashboard', { dashboardStats });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Internal Server Error');
  }
};
