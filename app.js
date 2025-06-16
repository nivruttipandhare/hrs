const express = require('express');
const path = require('path');
const session = require('express-session');


require('dotenv').config();


const db = require('./config/db');

const userRoutes = require('./routes/userRoutes.js');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


console.log("JWT SECRET:", process.env.JWT_SECRET)

const app = express();

app.use('/api/hotels', hotelRoutes);
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup session
app.use(session({
  secret: process.env.JWT_SECRET,  // use same secret
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.render('userDashboard');
});

// Mount routes (so /login, /register, /user/dashboard work directly)
app.use('/', authRoutes); 
app.use('/', userRoutes);
app.use('/', adminRoutes);

app.use('/book',bookingRoutes);

// Default route → redirect to login




// Server start
const PORT = 3500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
