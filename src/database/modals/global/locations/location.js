const mongoose = require('mongoose');


const area_localities = new mongoose.Schema(
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
        city : {
            type : String,
        },
        state : {
            type : String,
        }
	},
	{ timestamps: true }
);

const areaLocalities = mongoose.model('area_localities', area_localities);

module.exports = areaLocalities;