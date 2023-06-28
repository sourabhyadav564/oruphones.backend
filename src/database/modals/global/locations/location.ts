import { Schema, model } from 'mongoose';

const area_localities = new Schema(
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
		city: {
			type: String,
		},
		state: {
			type: String,
		},
	},
	{ timestamps: true }
);

const areaLocalities = model('area_localities', area_localities);

export = areaLocalities;
