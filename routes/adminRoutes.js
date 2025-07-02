// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // ✅ Must be correct path



//  Admin dashboard
router.get('/dashboard', adminController.showDashboard);

//  UserMaster data route (for  partial loading)
router.get('/usermaster', adminController.showUserMaster);


//delete usermaster
router.post('/delete-user/:id', adminController.deleteUser);
 



// ADD AREA MASTER
router.get('/area', adminController.getAreaPage);
router.post('/add-area', adminController.addArea);
router.post('/delete-area/:id', adminController.deleteArea);

// city master
// City Master Routes
// routes/adminRoutes.js
router.get('/city', adminController.getCityPage);         // Display city master page
router.post('/add-city', adminController.addCity);        // Handle adding new city
router.post('/delete-city/:id', adminController.deleteCity); // Handle deleting city by ID


// Review Management
// Review Management
router.get('/reviews', adminController.getAllReviews);
router.post('/add-review', adminController.addReview);
router.post('/delete-review/:id', adminController.deleteReview);


// Amenities
router.get('/amenities', adminController.getAmenitiesPage);
router.post('/add-amenity', adminController.addAmenity);
router.post('/delete-amenity/:id', adminController.deleteAmenity);


router.get('/dashboard', adminController.showDashboard);


module.exports = router;

