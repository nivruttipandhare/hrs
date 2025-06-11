const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ REGISTER CONTROLLER (redirects to login after registration)
exports.register = async (req, res) => {
  const { username, useremail, password, contact, type } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usermaster (username, useremail, password, contact, type) VALUES (?, ?, ?, ?, ?)",
      [username, useremail, hashedPassword, contact, type],
      (err) => {
        if (err) {
          console.error("Registration DB Error:", err);
          return res.render('register', { message: 'Registration Failed' });
        }

        // ✅ Redirect to login page after successful registration
        console.log("redirecting to login page");
        
        return res.redirect('/login');
      }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return res.render('register', { message: 'Error in registration' });
  }
};

// ✅ LOGIN CONTROLLER
exports.login = (req, res) => {
  const { useremail, password } = req.body;

  const sql = 'SELECT * FROM usermaster WHERE useremail = ?';

  db.query(sql, [useremail], async (err, results) => {
    if (err) {
      console.error("Login DB Error:", err);
      return res.render('login', { message: 'Database error' });
    }

    if (results.length === 0) {
      return res.render('login', { message: 'User not found' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { message: 'Incorrect password' });
    }

    // ✅ Store session
    req.session.user = {
      id: user.id,
      username: user.username,
      type: user.type,
    };

    // ✅ Redirect based on user type
    if (user.type === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/user/dashboard');
    }
  });
};
