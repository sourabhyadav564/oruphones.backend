const fs = require('fs');
const nodemailer = require('nodemailer');

const dotenv = require('dotenv');
dotenv.config();

const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'eghguoshcuniexbf',
	},
});

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO;

const generateCollectionDump = async (data) => {
	try {
		MongoClient.connect(url, function (err, db) {
			if (err) throw err;
			var dbo = db.db(process.env.Collection);
			dbo
				.collection('gsm_arena_mobiles')
				.find({})
				.toArray(function (err, result) {
					if (err) throw err;
					// console.log(result);
					fs.writeFileSync('gsm_arena_mobiles.json', JSON.stringify(result));
					db.close();
				});
			//   .deleteMany({})
			//   .then(() => {
			//     dbo
			//       .collection("complete_lsp_datas")
			//       .insertMany(data, function (err, res) {
			//         if (err) throw err;
			//         console.log(
			//           `${data.length} documents inserted successfully on ${dateFormat})}`
			//         );
			//         db.close();
			//       });
			//   });
		});

		//   let mailOptions = {
		//     from: "mobiruindia22@gmail.com",
		//     // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
		//     to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp",
		//     subject: "Data has successfully been migrated to MongoDB",
		//     text:
		//       "Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of scrapped models are: " +
		//       data.length +
		//       ". The data is not ready to use for other business logics",
		//   };

		//   config.sendMail(mailOptions, function (err, result) {
		//     if (err) {
		//       console.log(err);
		//     } else {
		//       console.log("Email sent: " + result.response);
		//     }
		//   });
	} catch (error) {
		console.log(error);
	}
};

module.exports = generateCollectionDump;
