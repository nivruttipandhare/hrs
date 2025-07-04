// controllers/hotelRoomController.js
exports.showEditPage = (req, res) => {
  const { hotel_id, room_id } = req.params;

  // 1. fetch hotels & rooms for dropdowns
  const sql = `
    SELECT hotel_id, hotel_name FROM hotelmaster;
    SELECT room_id,  room_type  FROM roommaster;
    SELECT hrj.hotel_id, hrj.room_id, hrj.price,
           h.hotel_name, r.room_type
    FROM   hotelroomjoin hrj
    JOIN   hotelmaster  h ON h.hotel_id  = hrj.hotel_id
    JOIN   roommaster   r ON r.room_id   = hrj.room_id
    WHERE  hrj.hotel_id = ? AND hrj.room_id = ?;
  `;

  db.query(sql, [hotel_id, room_id], (err, results) => {
    if (err) return res.status(500).send('DB error');

    const hotels    = results[0];
    const rooms     = results[1];
    const current   = results[2][0];            // current combination

    if (!current) return res.status(404).send('Entry not found');

    res.render('admin/editHotelRoom', { hotels, rooms, current, user: req.session.user });
  });
};


exports.updateRoomPrice = (req, res) => {
  const { hotel_id, room_id } = req.params;
  const { hotel_id: newHotelId, room_id: newRoomId, price } = req.body;

  const sql = `
    UPDATE hotelroomjoin
    SET hotel_id = ?, room_id = ?, price = ?
    WHERE hotel_id = ? AND room_id = ?
  `;

  db.query(sql, [newHotelId, newRoomId, price, hotel_id, room_id], (err) => {
    if (err) return res.status(500).send('Update error');
    res.redirect('/admin/hotelRooms');
  });
};

// controllers/hotelRoomController.js
const db = require('../config/db');

/* ---------- edit page ---------- */
exports.showEditPage = (req, res) => {
  const { hotel_id, room_id } = req.params;

  const sql = `
    SELECT hotel_id, hotel_name FROM hotelmaster;
    SELECT room_id,  room_type  FROM roommaster;
    SELECT hrj.hotel_id, hrj.room_id, hrj.price
    FROM   hotelroomjoin hrj
    WHERE  hrj.hotel_id = ? AND hrj.room_id = ?;
  `;

  db.query(sql, [hotel_id, room_id], (err, results) => {
    if (err) return res.status(500).send('DB error');

    const hotels  = results[0];
    const rooms   = results[1];
    const current = results[2][0];
    if (!current) return res.status(404).send('Entry not found');

    res.render('admin/editHotelRoom', { hotels, rooms, current, user: req.session.user });
  });
};

/* ---------- update handler ---------- */
exports.updateRoomPrice = (req, res) => {
  const { hotel_id, room_id } = req.params;
  const { hotel_id: newHotel, room_id: newRoom, price } = req.body;

  const sql = `
    UPDATE hotelroomjoin
    SET hotel_id = ?, room_id = ?, price = ?
    WHERE hotel_id = ? AND room_id = ?
  `;

  db.query(sql, [newHotel, newRoom, price, hotel_id, room_id], (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).send('Database error');
    }
    res.redirect('/admin/hotelRooms');
  });
};
