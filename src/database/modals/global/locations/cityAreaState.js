const mongoose = require('mongoose');


const cityareastatemerged = new mongoose.Schema(
	{
		parentId: {
			type: Number,
		},
		latitude: {
			type: Number,
		},
		longitude: {
			type: Number,
		},
		type: {
			type: String,
		},
		name: {
			type: String,
		},
		id: {
			type: String,
		},
	},
	{ timestamps: true }
);

const cityAreaStateMerged = mongoose.model('merged', cityareastatemerged);