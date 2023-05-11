const mongoose = require('mongoose');

const testDefaultImageSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
		brand_id: {
			type: String,
			required: true,
		},
		make: {
			type: String,
			required: true,
		},
		img: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const testDefaultImageModal = new mongoose.model(
	'test_default_images',
	testDefaultImageSchema
);

module.exports = testDefaultImageModal;
