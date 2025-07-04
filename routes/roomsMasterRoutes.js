const express = require('express');
const router = express.Router();
const roomsMasterController = require('../controllers/roomsMasterController');

// EJS view routes
router.get('/admin/rooms', roomsMasterController.getRooms);
router.post('/admin/rooms/add', roomsMasterController.addRoom);
// router.post('/admin/rooms/update/:room_id', roomsMasterController.updateRoom);
// router.post('/admin/rooms/delete/:room_id', roomsMasterController.deleteRoom);

module.exports = router;
