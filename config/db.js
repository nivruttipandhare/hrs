const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "coder",   // replace with your MySQL password
  database: "hotel"
});

connection.connect(err => {
  if (err) throw err;
  console.log("MySQL connected");
});

module.exports = connection;
