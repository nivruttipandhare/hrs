const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: true
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);   // ✅ Mounts all /user routes

// Protected dashboard
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome ${req.session.user.name}`);
  } else {
    res.redirect("/user/login");
  }
});

// Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
