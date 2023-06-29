const mongoose = require('mongoose');

const imeiSchema = new mongoose.Schema(
	{
		imei: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		manufacturer: {
			type: String,
		},
		model: {
			type: String,
		},
		deviceType: {
			type: String,
		},
		brand: {
			type: String,
		},
		listingId: {
			type: String,
			required: true,
		},
		deviceUniqueId: {
			type: String,
			required: true,
		},
		userUniqueId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const ImeiDataModal = new mongoose.model('imei_datas', imeiSchema);

module.exports = ImeiDataModal;
