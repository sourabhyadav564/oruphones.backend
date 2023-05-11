const mongoose = require('mongoose');

const smartphoneSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
			// required: true,
		},
		created_at: {
			type: String,
			// required: true,
		},
		updated_at: {
			type: String,
			// required: true,
		},
		name: {
			type: String,
			// required: true,
		},
		slug: {
			type: String,
			// required: true,
		},
		brand_id: {
			type: Number,
			// required: true,
		},
		img: {
			type: String,
			// required: true,
		},
		priority: {
			type: Number,
			// required: true,
		},
	},

	{ timestamps: true }
);

const smartphoneModal = new mongoose.model(
	'smartphone_models',
	smartphoneSchema
);

module.exports = smartphoneModal;
