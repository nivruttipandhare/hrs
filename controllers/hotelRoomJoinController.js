const db = require('../config/db');


// ✅ GET all hotel-room join records with hotel and room names
exports.getAll = (req, res) => {
  const fetchHotelRoomJoin = `
    SELECT hrj.*, hm.hotel_name, rm.room_type
    FROM hotelroomjoin hrj
    JOIN hotelmaster hm ON hrj.hotel_id = hm.hotel_id
    JOIN roomsmaster rm ON hrj.room_id = rm.room_id
  `;

  db.query(fetchHotelRoomJoin, (err, hotelRooms) => {
    if (err) {
      console.error("❌ Error fetching hotelRoomJoin:", err);
      return res.status(500).send("Internal Server Error");
    }

    db.query('SELECT * FROM hotelmaster', (err, hotels) => {
      if (err) {
        console.error("❌ Error fetching hotelmaster:", err);
        return res.status(500).send("Error fetching hotels");
      }

      db.query('SELECT * FROM roomsmaster', (err, rooms) => {
        if (err) {
          console.error("❌ Error fetching roomsmaster:", err);
          return res.status(500).send("Error fetching rooms");
        }

        res.render('admin/hotelRoomJoin', {
          hotelRooms,
          hotels,
          rooms
        });
      });
    });
  });
};

// ✅ ADD hotel-room-price entry
exports.add = (req, res) => {
  const { hotel_id, room_id, price } = req.body;
  console.log("🔥 FORM BODY:", req.body);

  if (!hotel_id || !room_id || !price) {
    console.warn("❌ Missing fields:", { hotel_id, room_id, price });
    return res.status(400).send("Missing required fields");
  }

  const insertSQL = `
    INSERT INTO hotelroomjoin (hotel_id, room_id, price)
    VALUES (?, ?, ?)
  `;

  db.query(insertSQL, [hotel_id, room_id, price], (err, result) => {
    if (err) {
      console.error("❌ Error inserting:", err);
      return res.status(500).send("Database Insert Error");
    }

    console.log("✅ Insert success:", result);
    res.redirect('/admin/hotelRooms');
  });
};

// ✅ UPDATE price by hotel_id and room_id
exports.update = (req, res) => {
  const { hotel_id, room_id } = req.params;
  const { price } = req.body;

  if (!price) {
    return res.status(400).send("Missing price");
  }

  const updateSQL = `
    UPDATE hotelroomjoin
    SET price = ?
    WHERE hotel_id = ? AND room_id = ?
  `;

  db.query(updateSQL, [price, hotel_id, room_id], (err, result) => {
    if (err) {
      console.error("❌ Update error:", err);
      return res.status(500).send("Database Update Error");
    }

    console.log("✅ Update success:", result);
    res.redirect('/admin/hotelRooms');
  });
};

// ✅ DELETE hotel-room-price entry
exports.delete = (req, res) => {
  const { hotel_id, room_id } = req.params;

  const deleteSQL = `
    DELETE FROM hotelroomjoin
    WHERE hotel_id = ? AND room_id = ?
  `;

  db.query(deleteSQL, [hotel_id, room_id], (err, result) => {
    if (err) {
      console.error("❌ Delete error:", err);
      return res.status(500).send("Database Delete Error");
    }

    console.log("✅ Delete success:", result);
    res.redirect('/admin/hotelRooms');
  });
};
