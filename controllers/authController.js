const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ✅ REGISTER CONTROLLER
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
          return res.status(500).json({ message: 'Registration Failed' });
        }
        return res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: 'Error in registration' });
  }
};

// ✅ LOGIN CONTROLLER
exports.login = (req, res) => {
  const { useremail, password } = req.body;

  const sql = 'SELECT * FROM usermaster WHERE useremail = ?';

  db.query(sql, [useremail], async (err, results) => {
    if (err) {
      console.error("Login DB Error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { userid: user.userid, username: user.username, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  });
};
