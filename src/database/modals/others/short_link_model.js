const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
	{
		unKey: {
			type: String,
			// required: true,
		},
		linkStr: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const shortLinkModal = new mongoose.model('short_links', linkSchema);

module.exports = shortLinkModal;
