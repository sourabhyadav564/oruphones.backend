const mongoose = require('mongoose');
const validator = require('validator');

const lspSchema = new mongoose.Schema(
	{
		make: {
			type: String,
			// required: true,
		},
		model: {
			type: String,
			// required: true,
		},
		storage: {
			type: String,
			// required: true,
		},
		ram: {
			type: String,
			// required: true,
		},
		condition: {
			type: String,
			// required: true,
		},
		vendor: {
			type: [
				{
					price: {
						type: Number,
						// required: true,
					},
					type: {
						type: String,
						// required: true,
					},
					vendor_id: {
						type: Number,
						// required: true,
					},
					warranty: {
						type: String,
						// required: true,
					},
				},
			],
		},
		lsp: {
			type: Number,
			// required: true,
		},
		isDerived: {
			type: Boolean,
			// required: true,
		},
		type: {
			type: String,
			// required: true,
		},
	},
	{ timestamps: true }
);

const lspModal = new mongoose.model('complete_lsp_datas', lspSchema);

module.exports = lspModal;
