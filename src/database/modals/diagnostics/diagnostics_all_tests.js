const mongoose = require('mongoose');

const dignosticsAllTestsSchema = new mongoose.Schema(
	{
		allTests: {
			type: [
				{
					name: {
						type: String,
						required: true,
					},
					displayname: {
						type: String,
						required: true,
					},
					category: {
						type: String,
						required: true,
					},
					severity: {
						type: String,
						required: true,
					},
					status: {
						type: String,
						required: true,
					},
					testCode: {
						type: String,
						required: true,
					},
					type: {
						type: String,
						required: true,
					},
				},
			],
			required: true,
		},
		allTestCategory: {
			type: [
				{
					VerifyDevice: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					BatteryCharging: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					SystemCrash: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					Connectivity: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					AudioVibrate: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					Camera: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					DisplayTouch: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					RunAllDiagnostics: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
					checkMyDevice: {
						type: [
							{
								type: String,
								required: true,
							},
						],
					},
				},
			],
		},
		allDescriptions: {
			type: [
				{
					VerifyDevice: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					BatteryCharging: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					SystemCrash: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					Connectivity: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					AudioVibrate: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					Camera: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					DisplayTouch: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					RunAllDiagnostics: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
					checkMyDevice: {
						displayname: {
							type: String,
							required: true,
						},
						description: {
							type: String,
							required: true,
						},
					},
				},
			],
		},
	},
	{ timestamps: true }
);

const dignosticsAllTestsModal = new mongoose.model(
	'diagnostic_datas',
	dignosticsAllTestsSchema
);

module.exports = dignosticsAllTestsModal;
