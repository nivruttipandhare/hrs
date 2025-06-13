const db = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { useremail, password } = req.body;

  console.log("Login Data:", req.body);

  db.query("SELECT * FROM usermaster WHERE useremail = ?", [useremail], async (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.render("login", { message: "Database error" });
    }

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
      return res.redirect('/admin/ashboard');
    } else {
      return res.redirect('/user/ashboard');
    }
  });
};
