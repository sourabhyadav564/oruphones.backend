const mongoose = require('mongoose');
const validator = require('validator');

const contactUsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			// required: true,
		},
		message: {
			type: String,
			// required: true,
		},
	},
	{ timestamps: true }
);

contactUsSchema.index({ mobile: 1 });

const contactUsModal = new mongoose.model('user_contact_us', contactUsSchema);

module.exports = contactUsModal;
