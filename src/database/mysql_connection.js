var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "44.241.42.74",
  user: "jaswanth",
  password: "Jaswanth@123",
  database: "wordpress",
  multipleStatements: true
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL Database Successfully");
});

module.exports = connection;