// ===== 📁 app.js =====
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelMasterRoutes = require('./routes/hotelMasterRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'YourSecretKey123',
  resave: false,
  saveUninitialized: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

const uploadPath = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ✅ Route definitions (before 404)
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', hotelMasterRoutes);
app.use('/admin/hotelMaster', hotelMasterRoutes);
app.use('/', userDashboardRoutes);
app.use('/admin/bookings', userDashboardRoutes);
app.use('/user', userDashboardRoutes);
app.use('/', userDashboardRoutes);

// Optional: Root route
app.get('/', (req, res) => {
  res.redirect('/user/dashboard');
});

// ✅ Catch-all 404 after all valid routes
app.use((req, res, next) => {
  res.status(404).send('Route not found: ' + req.originalUrl);
});

const PORT = 3500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
