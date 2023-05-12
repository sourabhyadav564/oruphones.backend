const mongoose = require('mongoose');
const validator = require('validator');

const dignosticsLogsSchema = new mongoose.Schema(
	{
		applicationVersion: {
			type: String,
			//   required: true,
		},
		carriers: {
			type: String,
			//   required: true,
		},
		categoryName: {
			type: String,
			//   required: true,
		},
		certified: {
			type: Boolean,
			//   required: true,
		},
		commandDetails: {
			type: [
				{
					commandName: {
						type: String,
						// required: true,
					},
					endDateTime: {
						type: Number,
						// required: true,
					},
					message: {
						type: String,
						// required: true,
					},
					sessionId: {
						type: Number,
						// required: true,
					},
					startDateTime: {
						type: Number,
						// required: true,
					},
					testStatus: {
						type: String,
						// required: true,
					},
				},
			],
		},
		companyName: {
			type: String,
			//   required: true,
		},
		deviceStatus: {
			type: String,
			//   required: true,
		},
		deviceUniqueId: {
			type: String,
			//   required: true,
		},
		endDateTime: {
			type: Number,
			//   required: true,
		},
		firmware: {
			type: String,
			//   required: true,
		},
		lastRestart: {
			type: Number,
			//   required: true,
		},
		locksRemoved: {
			type: String,
			//   required: true,
		},
		make: {
			type: String,
			//   required: true,
		},
		marketingName: {
			type: String,
			//   required: true,
		},
		model: {
			type: String,
			//   required: true,
		},
		osVersion: {
			type: String,
			//   required: true,
		},
		platform: {
			type: String,
			//   required: true,
		},
		productName: {
			type: String,
			//   required: true,
		},
		serialNumber: {
			type: String,
			//   required: true,
		},
		sesionStatus: {
			type: String,
			//   required: true,
		},
		sessionId: {
			type: Number,
			//   required: true,
		},
		startDateTime: {
			type: Number,
			//   required: true,
		},
		storeId: {
			type: String,
			//   required: true,
		},
		transactionName: {
			type: String,
			//   required: true,
		},
		userName: {
			type: String,
			//   required: true,
		},
	},
	{ timestamps: true }
);

const dignosticsLogsModal = new mongoose.model(
	'log_diag_transactions',
	dignosticsLogsSchema
);

module.exports = dignosticsLogsModal;
