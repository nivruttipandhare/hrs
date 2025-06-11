const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ REGISTER CONTROLLER
exports.register = async (req, res) => {
  const { username, useremail, password, contact, type } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO usermaster (username, useremail, password, contact, type) VALUES (?, ?, ?, ?, ?)",
    [username, useremail, hashedPassword, contact, type],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Registration Failed");
      }

      // ✅ Fetch newly registered user and set session
      db.query("SELECT * FROM usermaster WHERE useremail = ?", [useremail], (err2, result) => {
        if (err2 || result.length === 0) {
          console.error(err2);
          return res.send("Login session setup failed");
        }

        const user = result[0];

        req.session.user = {
          id: user.id,
          username: user.username,
          type: user.type,
        };

        // ✅ Redirect based on user type
        if (user.type === 'admin') {
          res.redirect('/admin/dashboard');
        } else {
          res.redirect('/user/dashboard');
        }
      });
    }
  );
};

// ✅ LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { useremail, password } = req.body;

  console.log("Login Data:", req.body);  // ✅ Good place to log it

  db.query("SELECT * FROM usermaster WHERE useremail = ?", [useremail], async (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.render("login", { message: "User not found" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', { message: 'Invalid password' });
    }

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
  }); // <-- Close db.query
}; // <-- Close exports.login
