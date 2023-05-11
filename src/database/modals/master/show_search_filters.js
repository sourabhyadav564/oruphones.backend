const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema(
	{
		Brand: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
		Color: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
		Storage: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
		Conditions: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
		Warranty: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
	},
	{ timestamps: true }
);

const filterModal = new mongoose.model('filter_datas', filterSchema);

module.exports = filterModal;
