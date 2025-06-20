const express = require('express');
const router = express.Router();
const hotelRoomJoinController = require('../controllers/hotelRoomJoinController');

router.get('/admin/hotelRooms', hotelRoomJoinController.getAll);
router.post('/admin/hotelRooms/add', hotelRoomJoinController.add);
router.post('/admin/hotelRooms/update/:hotel_id/:room_id', hotelRoomJoinController.update);
router.post('/admin/hotelRooms/delete/:hotel_id/:room_id', hotelRoomJoinController.delete);

module.exports = router;
