const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../Uploads/hotels');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        isValid ? cb(null, true) : cb(new Error('Only images (JPEG, JPG, PNG, GIF) are allowed!'));
    }
}).single('hotel_image');

// Get all hotels
const getHotels = (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    db.query('SELECT COUNT(*) AS count FROM hotelmaster WHERE hotel_name LIKE ?', [searchTerm], (err, countResult) => {
        if (err) return res.status(500).json({ message: 'Error counting hotels', error: err.message });

        const totalPages = Math.ceil(countResult[0].count / limit);
        const query = `
            SELECT hm.*, cm.city_name, am.area_name,
                GROUP_CONCAT(DISTINCT at.amenity_name ORDER BY at.amenity_name ASC SEPARATOR ', ') AS amenity_names
            FROM hotelmaster hm
            JOIN citymaster cm ON hm.city_id = cm.city_id
            JOIN areamaster am ON hm.area_id = am.area_id
            LEFT JOIN hotelamenitiesjoin haj ON hm.hotel_id = haj.hotel_id
            LEFT JOIN amenities at ON haj.amenity_id = at.amenity_id
            WHERE hm.hotel_name LIKE ?
            GROUP BY hm.hotel_id
            ORDER BY hm.hotel_name ASC
            LIMIT ?, ?`;

        db.query(query, [searchTerm, offset, limit], (err, hotels) => {
            if (err) return res.status(500).json({ message: 'Error fetching hotels', error: err.message });

            db.query('SELECT * FROM citymaster ORDER BY city_name ASC', (err, cities) => {
                if (err) return res.status(500).json({ message: 'Error loading cities', error: err.message });

                db.query('SELECT * FROM areamaster ORDER BY area_name ASC', (err, areas) => {
                    if (err) return res.status(500).json({ message: 'Error loading areas', error: err.message });

                    db.query('SELECT * FROM amenities ORDER BY amenity_name ASC', (err, amenities) => {
                        if (err) return res.status(500).json({ message: 'Error loading amenities', error: err.message });

                        res.render('admin/hotelMaster', {
                            user: req.session.user,
                            hotels,
                            cities,
                            areas,
                            amenities,
                            search,
                            currentPage: page,
                            totalPages,
                            activePage: 'hotels'
                        });
                    });
                });
            });
        });
    });
};

// Add new hotel
const addHotel = (req, res) => {
    upload(req, res, err => {
        if (err) return res.status(400).json({ message: 'Upload failed', error: err.message });

        const { hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount, amenities } = req.body;
        const hotel_image = req.file ? req.file.filename : null;
        const amenityIds = Array.isArray(amenities) ? amenities.map(Number) : (amenities ? [Number(amenities)] : []);

        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ message: 'DB connection error', error: err.message });

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: 'Transaction error', error: err.message });
                }

                const sql = `INSERT INTO hotelmaster 
                    (hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount, hotel_image) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount, hotel_image];

                connection.query(sql, values, (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: 'Failed to add hotel', error: err.message });
                        });
                    }

                    const hotel_id = result.insertId;
                    if (amenityIds.length > 0) {
                        const amenityValues = amenityIds.map(aid => [hotel_id, aid]);
                        connection.query('INSERT INTO hotelamenitiesjoin (hotel_id, amenity_id) VALUES ?', [amenityValues], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: 'Failed to insert amenities', error: err.message });
                                });
                            }
                            connection.commit(err => {
                                connection.release();
                                if (err) return res.status(500).json({ message: 'Commit failed', error: err.message });
                                res.redirect('/admin/hotelMaster');
                            });
                        });
                    } else {
                        connection.commit(err => {
                            connection.release();
                            if (err) return res.status(500).json({ message: 'Commit failed', error: err.message });
                            res.redirect('/admin/hotelMaster');
                        });
                    }
                });
            });
        });
    });
};

// Get edit hotel page
const getEditHotelPage = (req, res) => {
    const hotel_id = req.params.id;

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err.message });

        connection.query('SELECT * FROM hotelmaster WHERE hotel_id = ?', [hotel_id], (err, hotelResult) => {
            if (err || hotelResult.length === 0) {
                connection.release();
                return res.status(404).json({ message: 'Hotel not found' });
            }

            const hotel = hotelResult[0];

            connection.query('SELECT * FROM citymaster ORDER BY city_name ASC', (err, cities) => {
                if (err) return res.status(500).json({ message: 'Error loading cities', error: err.message });

                connection.query('SELECT * FROM areamaster ORDER BY area_name ASC', (err, areas) => {
                    if (err) return res.status(500).json({ message: 'Error loading areas', error: err.message });

                    connection.query('SELECT * FROM amenities ORDER BY amenity_name ASC', (err, allAmenities) => {
                        if (err) return res.status(500).json({ message: 'Error loading amenities', error: err.message });

                        connection.query('SELECT amenity_id FROM hotelamenitiesjoin WHERE hotel_id = ?', [hotel_id], (err, hotelAmenitiesResult) => {
                            connection.release();
                            if (err) return res.status(500).json({ message: 'Error fetching amenities', error: err.message });

                            const selectedAmenityIds = new Set(hotelAmenitiesResult.map(a => a.amenity_id));

                          res.render("admin/editHotelMaster",{
                                user: req.session.user,
                                 cities,
                                 
                                 
                                hotel,
                                cities,
                                areas,
                                allAmenities,
                                selectedAmenityIds,
                                activePage: 'hotels'
                            });
                        });
                    });
                });
            });
        });
    });
};

// Update hotel
const updateHotel = (req, res) => {
    const hotel_id = req.params.id;

    upload(req, res, err => {
        if (err) return res.status(400).json({ message: 'Upload failed', error: err.message });

        const { hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount, amenities } = req.body;
        const new_hotel_image = req.file ? req.file.filename : null;
        const amenityIds = Array.isArray(amenities) ? amenities.map(Number) : (amenities ? [Number(amenities)] : []);

        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ message: 'DB error', error: err.message });

            connection.beginTransaction(transErr => {
                if (transErr) {
                    connection.release();
                    return res.status(500).json({ message: 'Transaction error', error: transErr.message });
                }

                let old_hotel_image = null;
                if (new_hotel_image) {
                    connection.query('SELECT hotel_image FROM hotelmaster WHERE hotel_id = ?', [hotel_id], (err, imgResult) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: 'Error fetching image', error: err.message });
                            });
                        }
                        old_hotel_image = imgResult[0].hotel_image;
                        proceedUpdate();
                    });
                } else {
                    proceedUpdate();
                }

                function proceedUpdate() {
                    const updateSql = `
                        UPDATE hotelmaster
                        SET hotel_name = ?, city_id = ?, area_id = ?, hotel_email = ?, hotel_contact = ?, rating = ?, reviewcount = ?
                        ${new_hotel_image ? ', hotel_image = ?' : ''}
                        WHERE hotel_id = ?`;
                    const updateValues = [hotel_name, city_id, area_id, hotel_email, hotel_contact, rating, reviewcount];
                    if (new_hotel_image) updateValues.push(new_hotel_image);
                    updateValues.push(hotel_id);

                    connection.query(updateSql, updateValues, (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: 'Update failed', error: err.message });
                            });
                        }

                        connection.query('DELETE FROM hotelamenitiesjoin WHERE hotel_id = ?', [hotel_id], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ message: 'Amenity delete failed', error: err.message });
                                });
                            }

                            if (amenityIds.length > 0) {
                                const newAmenityValues = amenityIds.map(aid => [hotel_id, aid]);
                                connection.query('INSERT INTO hotelamenitiesjoin (hotel_id, amenity_id) VALUES ?', [newAmenityValues], (err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            res.status(500).json({ message: 'Amenity insert failed', error: err.message });
                                        });
                                    }
                                    commitTransactionAndCleanImage();
                                });
                            } else {
                                commitTransactionAndCleanImage();
                            }
                        });
                    });
                }

                function commitTransactionAndCleanImage() {
                    connection.commit(commitErr => {
                        connection.release();
                        if (commitErr) return res.status(500).json({ message: 'Commit failed', error: commitErr.message });

                        if (new_hotel_image && old_hotel_image) {
                            const oldImgPath = path.join(__dirname, '../Uploads/hotels', old_hotel_image);
                            fs.unlink(oldImgPath, err => {
                                if (err) console.error('Failed to delete old image:', err);
                            });
                        }

                        res.redirect('/admin/hotelMaster');
                    });
                }
            });
        });
    });
};

// Delete hotel
const deleteHotel = (req, res) => {
    const id = req.params.id;

    db.query('SELECT hotel_image FROM hotelmaster WHERE hotel_id = ?', [id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: 'Hotel not found' });

        const imageToDelete = result[0].hotel_image;

        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ message: 'DB error', error: err.message });

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: 'Transaction error', error: err.message });
                }

                connection.query('DELETE FROM hotelamenitiesjoin WHERE hotel_id = ?', [id], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ message: 'Amenity delete error', error: err.message });
                        });
                    }

                    connection.query('DELETE FROM hotelmaster WHERE hotel_id = ?', [id], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ message: 'Hotel delete error', error: err.message });
                            });
                        }

                        connection.commit(err => {
                            connection.release();
                            if (err) return res.status(500).json({ message: 'Commit failed', error: err.message });

                            if (imageToDelete) {
                                const imgPath = path.join(__dirname, '../Uploads/hotels', imageToDelete);
                                fs.unlink(imgPath, err => {
                                    if (err) console.error('Failed to delete image:', err);
                                });
                            }

                            res.redirect('/admin/hotelMaster');
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    getHotels,
    addHotel,
    deleteHotel,
    getEditHotelPage,
    updateHotel
};
