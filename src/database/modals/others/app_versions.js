const mongoose = require('mongoose');

const appVerSchema = new mongoose.Schema(
	{
		apk: {
			type: Number,
			required: true,
		},
		ios: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const appVersionsModal = new mongoose.model('app_version', appVerSchema);

module.exports = appVersionsModal;
