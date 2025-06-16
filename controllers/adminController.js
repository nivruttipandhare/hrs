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


// dlete user
exports.deleteUser = (req, res) => {
  const userId = req.params.id;


  db.query('DELETE FROM usermaster WHERE userid = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send('Error deleting user');
    }



    res.redirect('/admin/usermaster');
  });
};

  

// hotel add 
