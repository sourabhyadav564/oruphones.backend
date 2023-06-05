const mongoose = require('mongoose');

const deviceIdSchema = new mongoose.Schema({
	listingId: {
		type: String,
	},
	attachedTo: {
		type: String,
	},
	verifiedOn: {
		type: Date,
	},
	isExpired: {
		type: Boolean,
		default: false,
	},
	deviceUniqueId: {
		type: String,
	},
	payStatus: {
		type: String,
		default: 'N',
	},
});

const deviceIdModal = new mongoose.model('device_ids', deviceIdSchema);

module.exports = deviceIdModal;
