const express = require('express');
const path = require('path');
const session = require('express-session');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup session
app.use(session({
  secret: 'yoursecretkey',
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

// Default route → redirect to login


app.use('/', authRoutes);

// Server start
const PORT = 3500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
