const express = require('express');
const router = express.Router();

// ✅ Import controller (make sure the path is correct)
const hotelRoomJoinController = require('../controllers/hotelRoomJoinController');

// ✅ Import middleware if needed
const { isLoggedIn } = require('../middlewares/authMiddleware');

// ✅ Define routes using functions
router.get('/admin/hotelRooms', isLoggedIn, hotelRoomJoinController.getAll);
router.post('/admin/hotelRooms/add', isLoggedIn, hotelRoomJoinController.add);
router.post('/admin/hotelRooms/update/:hotel_id/:room_id', isLoggedIn, hotelRoomJoinController.update);
router.post('/admin/hotelRooms/delete/:hotel_id/:room_id', isLoggedIn, hotelRoomJoinController.delete);

module.exports = router;
