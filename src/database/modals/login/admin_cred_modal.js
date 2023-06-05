const mongoose = require('mongoose');

const credSchema = new mongoose.Schema(
	{
		username: {
			type: String,
		},
		password: {
			type: String,
			required: true,
		},
		key: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const adminCredModal = new mongoose.model('admin_creds', credSchema);

module.exports = adminCredModal;
