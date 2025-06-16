// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ✅ Admin dashboard
router.get('/dashboard', adminController.showDashboard);

// ✅ UserMaster data route (for AJAX partial loading)
router.get('/usermaster', adminController.showUserMaster);


//delete 
router.post('/delete-user/:id', adminController.deleteUser);

module.exports = router;
