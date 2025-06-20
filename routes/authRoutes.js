



// ===== 📁 routes/authRoutes.js =====
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', (req, res) => res.render('register', { message: null }));
router.post('/register', authController.register);

router.get('/login', (req, res) => res.render('login', { message: null }));
router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.redirect('/login');
  });
});


router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usermaster WHERE username = ? AND password = ?', [username, password], (err, result) => {
    if (err) return res.send('Database error');
    
    if (result.length > 0) {
      req.session.userId = result[0].userid;

      // 🔄 Optional: redirect to original page or default
      const redirectTo = req.session.redirectTo || '/user/hotelRecom';
      delete req.session.redirectTo;
      return res.redirect(redirectTo);
    } else {
      res.send('Invalid credentials');
    }
  });
});


module.exports = router;

