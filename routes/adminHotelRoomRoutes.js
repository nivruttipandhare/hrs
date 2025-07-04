const express = require('express');
const router  = express.Router();             // ✅ use Express’ Router

const hotelRoomController = require('../controllers/hotelRoomController');

/* -------- list page (optional) -------- */
router.get('/', hotelRoomController.listHotelRooms); // make sure listHotelRooms exists

/* -------- edit / update -------- */
router.get('/edit/:hotel_id/:room_id',   hotelRoomController.showEditPage);
router.post('/update/:hotel_id/:room_id', hotelRoomController.updateRoomPrice);

/* -------- add / delete -------- */
router.post('/add',                       hotelRoomController.addHotelRoom);
router.post('/delete/:hotel_id/:room_id', hotelRoomController.deleteHotelRoom);

module.exports = router;
