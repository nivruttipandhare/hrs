// src/routes/hotelMasterRoutes.js
const express = require('express');
const router = express.Router();

const hotelMasterController = require('../controllers/hotelMasterController');

router.get('/admin/hotelMaster', hotelMasterController.getHotels);
router.post('/admin/hotelMaster/add', hotelMasterController.addHotel);
router.get('/admin/hotelMaster/edit/:id', hotelMasterController.getEditHotelPage);
router.post('/admin/hotelMaster/update/:id', hotelMasterController.updateHotel);
router.get('/admin/hotelMaster/delete/:id', hotelMasterController.deleteHotel);

module.exports = router;
