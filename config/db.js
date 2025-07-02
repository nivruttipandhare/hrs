const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'coder',       // your MySQL password
  database: 'hotel',       // your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Connection Test
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release(); // important: release back to pool
  }
});

module.exports = pool;
