const db = require('../config/db');

// GET all rooms
exports.getRooms = (req, res) => {
  db.query('SELECT * FROM roomsmaster', (err, result) => {
    if (err) {
      console.error("❌ Fetch Error:", err);
      return res.status(500).send("Database error");
    }
    res.render('admin/roomsMaster', { rooms: result });
  });
};

// ADD room
exports.addRoom = (req, res) => {
  const { room_type } = req.body;

  if (!room_type || room_type.trim() === '') {
    return res.status(400).send("Missing room_type");
  }

  const query = 'INSERT INTO roomsmaster (room_type) VALUES (?)';
  db.query(query, [room_type], (err) => {
    if (err) {
      console.error("❌ Insert Error:", err);
      return res.status(500).send("Insert failed");
    }
    res.redirect('/admin/rooms');
  });
};

// UPDATE room
exports.updateRoom = (req, res) => {
  const { room_id } = req.params;
  const { room_type } = req.body;

  if (!room_type || room_type.trim() === '') {
    return res.status(400).send("Missing room_type");
  }

  const query = 'UPDATE roomsmaster SET room_type = ? WHERE room_id = ?';
  db.query(query, [room_type, room_id], (err) => {
    if (err) {
      console.error("❌ Update Error:", err);
      return res.status(500).send("Update failed");
    }
    res.redirect('/admin/rooms');
  });
};

// DELETE room
exports.deleteRoom = (req, res) => {
  const { room_id } = req.params;

  const query = 'DELETE FROM roomsmaster WHERE room_id = ?';
  db.query(query, [room_id], (err) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res.status(500).send("Delete failed");
    }
    res.redirect('/admin/rooms');
  });
};
