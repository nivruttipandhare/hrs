const db = require('../config/db');
const bcrypt = require('bcrypt');

// List of allowed admin usernames
const allowedAdminUsernames = ['admin1', 'admin2', 'admin3'];

exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM usermaster WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.render('login', { message: 'Database error' });
    }

    if (results.length === 0) {
      return res.render('login', { message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { message: 'Invalid password' });
    }

    // 🔐 Enforce admin restriction
    let role = user.role;
    if (role === 'admin' && !allowedAdminUsernames.includes(user.username)) {
      role = 'user'; // downgrade unauthorized admins
    }

    // Save to session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: role // validated role
    };

    // Redirect based on validated role
    if (role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/user/dashboard');
    }
  });
};
