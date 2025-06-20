const { recommendHotelsByUser } = require('../services/hotelRecomServices');

const getRecommendations = async (req, res) => {
  const userId = req.session.userId;

  try {
    const recommendations = await recommendHotelsByUser(userId);
    console.log('✅ Recommendations for user', userId, recommendations);
    res.render('user/hotelRecom', { recommendations });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).send('Error loading recommendations');
  }
};

module.exports = { getRecommendations };
