const db = require('../config/db');

exports.showDashboard = (req, res) => {
  const user = req.session.user;
  if (!user || user.type !== 'admin') return res.redirect('/login');
  res.render('adminDashboard', { user });
};



exports.showUserMaster = async (req, res) => {
  const user = req.session.user; // assuming user info is stored in session
  const [users] = await db.promise().query("SELECT * FROM usermaster where type != 'admin'");
  res.render('partials/userMaster', { users, user }); // ✅ pass user
};

// delete user
exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  const deleteQuery = 'DELETE FROM usermaster WHERE userid = ?';

  db.query(deleteQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send('Server error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('User not found');
    }

    res.redirect('/admin/usermaster'); // Redirect back to user listing page
  });
};




// areamaster
// Renders the Area Master page with optional search
// Renders the Area Master page with optional search
exports.getAreaPage = (req, res) => {
  const search = req.query.search || '';
  const sql = search
    ? "SELECT * FROM areamaster WHERE area_name LIKE ?"
    : "SELECT * FROM areamaster";
  const values = search ? [`%${search}%`] : [];

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).send("Error fetching areas");
   res.render('admin/areaMaster', {
  areas: results,
  search,
  user: req.session.user  // ✅ Add this line
});




  });
};

// Handles adding a new area
exports.addArea = (req, res) => {
  const { area_name } = req.body;
  if (!area_name) return res.status(400).send('Area name is required');

  const sql = "INSERT INTO areamaster (area_name) VALUES (?)";
  db.query(sql, [area_name], (err) => {
    if (err) return res.status(500).send('Error adding area');
    res.redirect('/admin/area'); // ✅ Redirect to view updated list
  });
};

// Handles deleting an area
exports.deleteArea = (req, res) => {
  const areaId = req.params.id;
  const sql = "DELETE FROM areamaster WHERE area_id = ?";
  db.query(sql, [areaId], (err) => {
    if (err) return res.status(500).send('Error deleting area');
    res.redirect('/admin/area'); // ✅ Redirect to view updated list
  });
};








// City Master
// Show City Page
exports.getCityPage = (req, res) => {
  const search = req.query.search || '';
  const query = search
    ? 'SELECT * FROM citymaster WHERE city_name LIKE ?'
    : 'SELECT * FROM citymaster';

  db.query(query, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).send('Error fetching cities');
    res.render('admin/cityMaster', { cities: results, search, user: req.session.user });
  });
};

// Add City
exports.addCity = (req, res) => {
  const { city_name, pincode } = req.body;
  if (!city_name || !pincode) return res.status(400).send('Missing data');

  db.query('INSERT INTO citymaster (city_name, pincode) VALUES (?, ?)', [city_name, pincode], (err) => {
    if (err) return res.status(500).send('Error adding city');
    res.redirect('/admin/city');
  });
};

// Delete City
exports.deleteCity = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM citymaster WHERE city_id = ?', [id], (err) => {
    if (err) return res.status(500).send('Error deleting city');
    res.redirect('/admin/city');
  });
};




// Fetch all reviews with hotel name and user ID
exports.addReview = (req, res) => {
  const { rev_text, rating, hotel_id, userid } = req.body;
  const insertReview = 'INSERT INTO reviewmaster (rev_text, rating, rev_date) VALUES (?, ?, NOW())';

  db.query(insertReview, [rev_text, rating], (err, result) => {
    if (err) return res.status(500).send('Insert error');

    const rev_id = result.insertId;
    const joinQuery = 'INSERT INTO hotelreviewjoin (userid, hotel_id, rev_id) VALUES (?, ?, ?)';
    const updateCount = `
      INSERT INTO hotelreviewcount (hotel_id, count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE count = count + 1
    `;

    db.query(joinQuery, [userid, hotel_id, rev_id], (err) => {
      if (err) return res.status(500).send('Join insert error');

      db.query(updateCount, [hotel_id], (err) => {
        if (err) return res.status(500).send('Review count update error');

        res.redirect('/admin/reviews');
      });
    });
  });
};

exports.deleteReview = (req, res) => {
  const rev_id = req.params.id;
  const getHotelId = 'SELECT hotel_id FROM hotelreviewjoin WHERE rev_id = ?';

  db.query(getHotelId, [rev_id], (err, result) => {
    if (err || !result.length) return res.status(500).send('Not found');
    const hotel_id = result[0].hotel_id;

    db.query('DELETE FROM hotelreviewjoin WHERE rev_id = ?', [rev_id], (err) => {
      if (err) return res.status(500).send('Join delete error');

      db.query('DELETE FROM reviewmaster WHERE rev_id = ?', [rev_id], (err) => {
        if (err) return res.status(500).send('Review delete error');

        db.query('UPDATE hotelreviewcount SET count = count - 1 WHERE hotel_id = ?', [hotel_id], (err) => {
          if (err) return res.status(500).send('Count update error');

          res.redirect('/admin/reviews');
        });
      });
    });
  });
};

exports.getAllReviews = (req, res) => {
  const sql = `
    SELECT r.rev_id, r.rev_text, r.rating, r.rev_date, h.hotel_name, j.userid
    FROM reviewmaster r
    JOIN hotelreviewjoin j ON r.rev_id = j.rev_id
    JOIN hotelmaster h ON h.hotel_id = j.hotel_id
    ORDER BY r.rev_date DESC
  `;

  db.query(sql, (err, reviews) => {
    if (err) return res.status(500).send("Error fetching reviews");

    res.render('admin/reviewMaster', {
      reviews,
      user: req.session.user || { username: 'Admin' }
    });
  });
};




// Show amenities page with optional search
exports.getAmenitiesPage = (req, res) => {
  const search = req.query.search || '';
  const query = search
    ? 'SELECT * FROM amenities WHERE amenity_name LIKE ?'
    : 'SELECT * FROM amenities';

  db.query(query, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).send('Error fetching amenities');
    res.render('admin/amenities', {
      amenities: results,
      search,
      user: req.session.user  // ✅ Important for include
    });
  });
};

// Add new amenity
exports.addAmenity = (req, res) => {
  const { amenity_name } = req.body;
  if (!amenity_name) return res.status(400).send('Amenity name required');

  db.query('INSERT INTO amenities (amenity_name) VALUES (?)', [amenity_name], (err) => {
    if (err) return res.status(500).send('Error adding amenity');
    res.redirect('/admin/amenities');
  });
};

// Delete amenity
exports.deleteAmenity = (req, res) => {
  const amenity_id = req.params.id;
  db.query('DELETE FROM amenities WHERE amenity_id = ?', [amenity_id], (err) => {
    if (err) return res.status(500).send('Error deleting amenity');
    res.redirect('/admin/amenities');
  });
};
