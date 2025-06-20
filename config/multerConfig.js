const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelMasterController');
const multer = require('multer');
const path = require('path');

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure "uploads" folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Hotel Add Route
router.post('/hotelMaster/add', upload.single('hotel_image'), hotelController.addHotel);

module.exports = router;
