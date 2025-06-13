const db = require('../config/db');

exports.showDashboard = (req, res) => {
  const user = req.session.user;
  if (!user || user.type !== 'admin') return res.redirect('/login');
  res.render('adminDashboard', { user });
};



exports.showUserMaster = async (req, res) => {
  const user = req.session.user; // assuming user info is stored in session
  const [users] = await db.promise().query("SELECT * FROM usermaster");
  res.render('partials/userMaster', { users, user }); // ✅ pass user
};


exports.deleteUser=(req, res) =>{
  
}