// var mysql = require('mysql');
var mysql = require('mysql2');

var connection = mysql.createConnection({
	//   host: "44.241.42.74",
	//   user: "jaswanth",
	//   password: "Jaswanth@123",
	//   database: "wordpress",
	//   multipleStatements: true
	host: '52.2.103.164',
	user: 'jerry',
	password: 'Jerry_1234',
	database: 'wordpress',
	multipleStatements: true,
});

connection.connect(function (err) {
	if (err) throw err;
	console.log('Connected to MySQL Database Successfully');
});

module.exports = connection;
