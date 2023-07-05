const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
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
		displayWithImage: {
			type: String,
		},
		imgpath: {
			type: String,
		},
	},
	{ timestamps: true }
);

const cityAreaModal = new mongoose.model('area_cities', citySchema);
citySchema.index({ id: 1, name :1 });


module.exports = cityAreaModal;
