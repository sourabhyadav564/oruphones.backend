const mongoose = require('mongoose');

const makeModalSchema = new mongoose.Schema(
	{
		make: {
			type: String,
			required: true,
		},
		models: {
			type: [
				{
					marketingname: {
						type: String,
						required: true,
					},
					storage: [
						{
							type: String,
							required: true,
						},
					],
					color: [
						{
							type: String,
							required: true,
						},
					],
				},
			],
			required: true,
		},
	},
	{ timestamps: true }
);

const makeBrandModal = new mongoose.model('make_modal', makeModalSchema);

module.exports = makeBrandModal;
