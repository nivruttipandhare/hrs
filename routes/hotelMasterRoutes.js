const express = require('express');
const router = express.Router();
const hotelMasterController = require('../controllers/hotelMasterController');
const upload = require('../middlewares/upload'); // ✅ Import multer config once

// Hotel routes
router.get('/', hotelMasterController.getHotels);
router.get('/add', hotelMasterController.getAddHotelPage);
router.post('/add', upload.single('hotel_image'), hotelMasterController.addHotel);
router.get('/edit/:id', hotelMasterController.getEditHotelPage);
router.post('/edit/:id', upload.single('hotel_image'), hotelMasterController.updateHotel);
router.post('/delete/:id', hotelMasterController.deleteHotel);





module.exports = router;