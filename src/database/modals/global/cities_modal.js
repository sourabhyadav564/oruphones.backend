const mongoose = require('mongoose');
const validator = require('validator');

const citySchema = new mongoose.Schema(
	{
		imgpath: {
			type: String,
		},
		city: {
			type: String,
			required: true,
		},
		displayWithImage: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

citySchema.index({ city: 1 });

const cityModal = mongoose.model('listed_cities', citySchema);

module.exports = cityModal;
