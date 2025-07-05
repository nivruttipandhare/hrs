// ===== 📁 app.js =====
const express = require('express');

const session = require('express-session');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');

const app = express();

// ✅ Middlewares (must come first)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'YourSecretKey123',   // Change to a secure, long string in production
  resave: false,
  saveUninitialized: false,     // Better security: no session unless modified
  cookie: {
    httpOnly: true,             // Prevents JavaScript access (safe)
    maxAge: 24 * 30*60 * 1000 // 1 day
    // secure: true             // Uncomment if you're using HTTPS
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ✅ Static Paths
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Ensure uploads folder exists
const uploadPath = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Routes Import
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelMasterRoutes = require('./routes/hotelMasterRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');
const roomsMasterRoutes = require('./routes/roomsMasterRoutes');
const hotelRoomJoinRoutes = require('./routes/hotelRoomJoinRoutes');

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/', reviewRoutes); // ✅ mount routes


//hotelRecom
const hotelRecomRoutes = require('./routes/hotelRecomRoutes');
app.use('/', hotelRecomRoutes); // This allows /user/hotelRecom to work
1


const bookingRoutes = require('./routes/bookingRoutes');
app.use('/',bookingRoutes);  // ✅ now handles /admin/bookings/:id/edit





// app.use("/",hotelRoomJoinRoutes);
app.use('/admin/hotelRooms', hotelRoomJoinRoutes);

// ✅  MUST be exactly one line like this:



app.use('/admin/hotelMaster', hotelMasterRoutes);
// ✅ Use Routes
app.use("/", roomsMasterRoutes);
app.use("/", hotelRoomJoinRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);

app.use("/admin", adminRoutes);
app.use("/", hotelMasterRoutes);
 app.use("/admin", hotelRoomJoinRoutes); // Already used above if needed at /admin
 // Already used above

app.use("/user", userDashboardRoutes);
app.use("/api", userDashboardRoutes);
app.use("/", userDashboardRoutes); // Optional fallback

// ✅ 404 Catch-All
app.use((req, res) => {
  res.status(404).send('Route not found: ' + req.originalUrl);
});

app.listen(3500, () => {
  console.log('Server running on port 3500');
});