const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
		},
		name: {
			type: String,
		},
		type: {
			type: String,
		},
		longitude: {
			type: Number,
		},
		latitude: {
			type: Number,
		},
		parentId: {
			type: Number,
		},
	},
	{ timestamps: true }
);

const AreaModal = new mongoose.model('area_locs', areaSchema);

module.exports = AreaModal;
