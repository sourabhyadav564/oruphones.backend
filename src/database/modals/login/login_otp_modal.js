const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
	{
		countryCode: {
			type: Number || String,
			// required: true,
		},
		mobileNumber: {
			type: Number || String,
			required: true,
		},
		otp: {
			type: Number || String,
			required: true,
		},
	},
	{ timestamps: true }
);

const userModal = new mongoose.model('user_datas', userSchema);

module.exports = userModal;
