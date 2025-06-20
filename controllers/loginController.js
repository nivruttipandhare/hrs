const db = require('../config/db');
const bcrypt = require('bcrypt');

//  LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { useremail, password } = req.body;

  const sql = 'SELECT * FROM usermaster WHERE useremail = ?';

  db.query(sql, [useremail], async (err, results) => {
    if (err) {
      console.error("Login DB Error:", err);
      return res.status(500).render('login', { message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).render('login', { message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('login', { message: 'Incorrect password' });
    }

    // ✅ Save user in session
    req.session.user = {
      userid: user.userid,
      username: user.username,
      type: user.type
    };

    // ✅ Redirect based on user type
    if (user.type === 'admin') {
      return res.redirect('/admin/ashboard');
    } else {
      return res.redirect('/user/ashboard');
    }
  });
};
