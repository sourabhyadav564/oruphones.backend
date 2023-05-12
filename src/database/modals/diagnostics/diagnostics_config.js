const mongoose = require('mongoose');
const validator = require('validator');

const dignosticsConfigSchema = new mongoose.Schema(
	{
		airplaneMode: {
			type: Boolean,
			required: true,
		},
		apilevel: {
			type: String,
			required: true,
		},
		appSubMode: {
			type: String,
			required: true,
		},
		appVersion: {
			type: String,
			required: true,
		},
		availableFrontCams: {
			type: Number,
			required: true,
		},
		availableRearCams: {
			type: Number,
			required: true,
		},
		avlInternalStorage: {
			type: Number,
			required: true,
		},
		avlRAM: {
			type: Number,
			required: true,
		},
		batteryCharging: {
			type: Boolean,
			required: true,
		},
		batteryDesignCapacityQuick: {
			type: Number,
			required: true,
		},
		batteryFullChargeCapacity: {
			type: Number,
			required: true,
		},
		batteryHealth: {
			type: String,
			required: true,
		},
		batteryLevel: {
			type: Number,
			required: true,
		},
		batteryMaxCapacity: {
			type: Number,
			required: true,
		},
		batteryPlugged: {
			type: String,
			required: true,
		},
		batterySOH: {
			type: Number,
			required: true,
		},
		batteryTemperature: {
			type: Number,
			required: true,
		},
		batteryType: {
			type: String,
			required: true,
		},
		batteryVoltage: {
			type: Number,
			required: true,
		},
		buildnumber: {
			type: String,
			required: true,
		},
		carriers: {
			type: String,
			default: 'NA',
			// required: true,
		},
		connectedNetworkType: {
			type: String,
			required: true,
		},
		countryCode: {
			type: String,
			default: 'NA',
			// required: true,
		},
		defaultMobileData: {
			type: String,
			required: true,
		},
		deviceId: {
			type: String,
			required: true,
		},
		deviceLocale: {
			type: String,
			required: true,
		},
		deviceStorageCapacity: {
			type: Number,
			required: true,
		},
		firmware: {
			type: String,
			required: true,
		},
		genuineOS: {
			type: Boolean,
			required: true,
		},
		lastRestart: {
			type: Number,
			required: true,
		},
		make: {
			type: String,
			required: true,
		},
		mobileData: {
			type: Boolean,
			required: true,
		},
		model: {
			type: String,
			required: true,
		},
		osVersion: {
			type: String,
			required: true,
		},
		platform: {
			type: String,
			required: true,
		},
		roamingMobileData: {
			type: Boolean,
			required: true,
		},
		serialNo: {
			type: String,
			default: 'NA',
			// required: true,
		},
		sim1ICCID: {
			type: String,
			default: 'NA',
			// required: true,
		},
		sim2ICCID: {
			type: String,
			default: 'NA',
			// required: true,
		},
		simSlot1: {
			type: String,
			required: true,
		},
		simSlot2: {
			type: String,
			required: true,
		},
		storeId: {
			type: String,
			required: true,
		},
		totalInternalStorage: {
			type: Number,
			required: true,
		},
		totalRAM: {
			type: Number,
			required: true,
		},
		transactionName: {
			type: String,
			required: true,
		},
		unavailableFeatures: {
			type: [
				{
					type: String,
					required: true,
				},
			],
			required: true,
		},
		wifi: {
			type: Boolean,
			required: true,
		},
		sessionId: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const dignosticsConfigModal = new mongoose.model(
	'diagnostics_config',
	dignosticsConfigSchema
);

module.exports = dignosticsConfigModal;
