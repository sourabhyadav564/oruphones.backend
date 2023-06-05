const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema(
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
	},
	{ timestamps: true }
);

const stateAreaModal = new mongoose.model('area_states', stateSchema);

module.exports = stateAreaModal;
