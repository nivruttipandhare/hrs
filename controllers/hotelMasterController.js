const db = require('../config/db');
const hotelController = require('../controllers/hotelMasterController');

// =========================
// GET Hotels (with Search + Pagination + City/Area)
// =========================
exports.getHotels = (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const searchTerm = `%${search}%`;

  const countQuery = `SELECT COUNT(*) AS count FROM hotelmaster 
                      JOIN citymaster ON hotelmaster.city_id = citymaster.city_id
                      JOIN areamaster ON hotelmaster.area_id = areamaster.area_id
                      WHERE hotel_name LIKE ?`;

  const dataQuery = `SELECT hotelmaster.*, citymaster.city_name, areamaster.area_name 
                     FROM hotelmaster
                     JOIN citymaster ON hotelmaster.city_id = citymaster.city_id
                     JOIN areamaster ON hotelmaster.area_id = areamaster.area_id
                     WHERE hotel_name LIKE ?
                     LIMIT ?, ?`;

  db.query(countQuery, [searchTerm], (err, countResult) => {
    if (err) return res.status(500).send('Error fetching count');

    const totalHotels = countResult[0].count;
    const totalPages = Math.ceil(totalHotels / limit);

    db.query(dataQuery, [searchTerm, offset, limit], (err, hotels) => {
      if (err) return res.status(500).send('Error fetching hotels');

      db.query('SELECT * FROM citymaster', (err, cities) => {
        if (err) return res.status(500).send('Error fetching cities');

        db.query('SELECT * FROM areamaster', (err, areas) => {
          if (err) return res.status(500).send('Error fetching areas');

          res.render('admin/hotelMaster', {
            user: req.session.user,
            hotels,
            cities,
            areas,
            search,
            currentPage: page,
            totalPages,
            activePage: 'hotels'
          });
        });
      });
    });
  });
};

// =========================
// GET Add Hotel Page
// =========================
exports.getAddHotelPage = (req, res) => {
  db.query('SELECT * FROM citymaster', (err, cities) => {
    if (err) return res.status(500).send('Error fetching cities');

    db.query('SELECT * FROM areamaster', (err, areas) => {
      if (err) return res.status(500).send('Error fetching areas');

      res.render('admin/hotelMaster', {
        user: req.session.user,
        hotels: [],
        cities,
        areas,
        search: '',
        currentPage: 1,
        totalPages: 1,
        activePage: 'hotels'
      });
    });
  });
};

// =========================
// ADD Hotel
// =========================

exports.addHotel = (req, res) => {
  const {
    hotel_name,
    city_id,
    area_id,
    hotel_email,
    hotel_contact,
    rating,
    reviewcount
  } = req.body;

  const hotel_image = req.file ? req.file.filename : null;

  const sql = `INSERT INTO hotelmaster 
    (hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount, hotel_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    hotel_name,
    city_id,
    area_id,
    hotel_email,
    hotel_contact,
    rating,
    reviewcount,
    hotel_image
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting hotel:', err);
      return res.status(500).send('Database insert error');
    }
    res.redirect('/admin/hotelMaster');
  });
};

// =========================
// GET Edit Hotel Form
// =========================
exports.getEditHotelPage = (req, res) => {
  const hotelId = req.params.id;

  const hotelQuery = 'SELECT * FROM hotelmaster WHERE hotel_id = ?';
  const citiesQuery = 'SELECT * FROM citymaster';
  const areasQuery = 'SELECT * FROM areamaster';

  db.query(hotelQuery, [hotelId], (err, hotelResult) => {
    if (err || hotelResult.length === 0) {
      return res.status(500).send('Hotel not found or fetch error');
    }

    const hotel = hotelResult[0];

    db.query(citiesQuery, (err, cities) => {
      if (err) return res.status(500).send('Error fetching cities');

      db.query(areasQuery, (err, areas) => {
        if (err) return res.status(500).send('Error fetching areas');

        res.render('admin/editHotel', {
          user: req.session.user,
          hotel,
          cities,
          areas
        });
      });
    });
  });
};

// =========================
// UPDATE Hotel
// =========================
exports.updateHotel = (req, res) => {
  const { id } = req.params;
  const {
    hotel_name, city_id, area_id,
    hotel_email, hotel_contact, rating, reviewcount,
    existing_image
  } = req.body;

  const hotel_image = req.file ? req.file.filename : existing_image;

  const sql = `
    UPDATE hotelmaster SET 
      hotel_name = ?, city_id = ?, area_id = ?, 
      hotel_email = ?, hotel_contact = ?, rating = ?, 
      reviewcount = ?, hotel_image = ?
    WHERE hotel_id = ?`;

  const values = [
    hotel_name.trim(),
    parseInt(city_id),
    parseInt(area_id),
    hotel_email.trim(),
    hotel_contact.trim(),
    parseFloat(rating),
    parseInt(reviewcount),
    hotel_image,
    parseInt(id)
  ];

  db.query(sql, values, (err) => {
    if (err) {
      return res.status(500).send('Update failed.');
    }

    res.redirect('/admin/hotelMaster');
  });
};

// =========================
// DELETE Hotel
// =========================
exports.deleteHotel = (req, res) => {
  const hotelId = req.params.id;

  db.query('DELETE FROM hotelmaster WHERE hotel_id = ?', [hotelId], (err) => {
    if (err) {
      return res.status(500).send('Error deleting hotel');
    }
    res.redirect('/admin/hotelMaster');
  });
};