const mongoose = require('mongoose');

const scrappedMitrasSchema = new mongoose.Schema({
	kioskId: {
		type: String,
	},
	name: {
		type: String,
	},
	address: {
		type: String,
	},
	district: {
		type: String,
	},
	status: {
		type: String,
	},
});

const scrappedMitrasModal = new mongoose.model(
	'a_listed_oru_mitras',
	scrappedMitrasSchema
);

module.exports = scrappedMitrasModal;
