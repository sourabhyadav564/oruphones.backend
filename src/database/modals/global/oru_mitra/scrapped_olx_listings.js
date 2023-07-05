const mongoose = require('mongoose');

const olxScrappedSchema = new mongoose.Schema(
	{
		price: {
			type: Number,
		},
		link: {
			type: String,
		},
		date: {
			type: String,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		make: {
			type: String,
		},
		userName: {
			type: String,
		},
		description: {
			type: String,
		},
		title: {
			type: String,
		},
		location: {
			type: String,
		},
		locality: {
			type: String,
		},
		condition: {
			type: String,
		},
		olxId: {
			type: String,
		},
		chatLink: {
			type: String,
		},
		assignedTo: {
			type: String,
		},
		previouslyAssignedTo: {
			type: Array,
		},
		status: {
			type: String,
			default: 'Live',
		},
		createdAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

const olxScrappedModal = new mongoose.model(
	'olx_scrapped_phones',
	olxScrappedSchema
);

module.exports = olxScrappedModal;