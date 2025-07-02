const { recommendHotelsByUser } = require('../services/hotelRecomServices');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.session.user?.userid;

    if (!userId) {
      console.warn("⚠️ No user ID found in session.");
      return res.redirect('/login');
    }

    console.log("✅ Session User ID:", userId);

    const recommendations = await recommendHotelsByUser(userId, 5);

    res.render('user/hotelRecom', { recommendations });
  } catch (err) {
    console.error("❌ Recommendation Error:", err);
    res.render('user/hotelRecom', { recommendations: [], error: "Failed to load recommendations." });
  }
};
