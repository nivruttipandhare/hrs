const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const userRoutes = require('./routes/userApiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userApiRoutes = require('./routes/userApiRoutes');  // ✅ only keep this for API

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'yoursecretkey',
  resave: false,
  saveUninitialized: false
}));

// Web routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

// API routes
app.use('/api/user', userApiRoutes);  // ✅ final api routes

app.get('/', (req, res) => {
  res.render('userDashboard');
});

app.use('/api/auth', authRoutes);

const PORT = 3500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
