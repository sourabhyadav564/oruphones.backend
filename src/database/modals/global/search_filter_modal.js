const mongoose = require('mongoose');

const searchFilterSchema = new mongoose.Schema(
	{
		make: {
			type: [
				{
					type: String,
				},
			],
		},
		models: {
			type: [
				{
					type: String,
				},
			],
		},
	},
	{ timestamps: true }
);

searchFilterSchema.index({ make: 1 });

const searchFilterModal = new mongoose.model(
	'search_filters',
	searchFilterSchema
);

module.exports = searchFilterModal;
