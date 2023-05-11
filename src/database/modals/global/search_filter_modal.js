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

const searchFilterModal = new mongoose.model(
	'search_filters',
	searchFilterSchema
);

module.exports = searchFilterModal;
