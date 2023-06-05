const express = require('express');
const router = express.Router();
const logEvent = require('../../../middleware/log_event');
const generateRandomNumber = require('@/utils/generate_random_number');
const fs = require('fs');
const moment = require('moment');
const is_Session = require('../../../middleware/is_Session')
const dignosticsConfigModal = require('@/database/modals/diagnostics/diagnostics_config');
const gsmarenaModal = require('@/database/modals/master/marketing_name_by_model');
const diagnosticsAllTests = require('@/database/modals/diagnostics/diagnostics_all_tests');
const saveListingModal = require('@/database/modals/device/save_listing_device');
// const connection = require("@/database/mysql_connection");
const getRecommendedPrice = require('@/utils/get_recommended_price');
const questionModal = require('@/database/modals/master/get_question');
const dignosticsLogsModal = require('@/database/modals/diagnostics/diagnostics_log_transection');
const validUser = require('@/middleware/valid_user');
const bestDealsModal = require('@/database/modals/others/best_deals_models');
const deviceIdModal = require('@/database/modals/global/device_id_list_modal');

router.post('/diagConfig', async (req, res) => {
	const randomNumber = generateRandomNumber();
	let diagnosticsDataObject = await diagnosticsAllTests.find();

	let allTest = diagnosticsDataObject[0]['allTests'];
	let allDescriptions = diagnosticsDataObject[0]['allDescriptions'];
	let allTestCategory = diagnosticsDataObject[0]['allTestCategory'][0];

	let data = {};
	let category = [];
	// TODO: Physical test will be added soon in the future
	let physicalTests = [];
	let unavailableFeatures = req.body.unavailableFeatures;
	let make = req.body.make;
	let model = req.body.model;
	let latestFirmwareVersion = req.body.firmware; //TODO: Need to get the latest firmware version every time
	let platform = req.body.platform;
	let batteryDesignCapacityQuick = req.body.batteryDesignCapacityQuick;
	let lastRestart = req.body.lastRestart;

	const filtered = (categoryType) => {
		console.log('categoryType', categoryType, allDescriptions[0]['_doc']);
		let categoryObject = {};
		categoryObject['issueName'] =
			categoryType == 'BuyerVerification' ? 'RunAllDiagnostics' : categoryType;
		categoryObject['displayname'] =
			allDescriptions[0]['_doc'][categoryType]['displayname'];
		categoryObject['description'] =
			allDescriptions[0]['_doc'][categoryType]['description'];

		categoryType =
			categoryType == 'checkMyDevice' ? 'RunAllDiagnostics' : categoryType;

		let testToBeSend = [];
		let autoTests = [];
		let manualTests = [];
		allTestCategory['_doc'][categoryType].forEach((item) => {
			allTest.forEach((element) => {
				if (element.name === item) {
					testToBeSend.push(element);
				}
			});
		});

		testToBeSend.filter((item) => {
			if (unavailableFeatures.includes(item.name)) {
				testToBeSend.splice(testToBeSend.indexOf(item), 1);
			}
		});
		testToBeSend.filter((item) => {
			if (item.type === 'Auto') {
				autoTests.push(item);
			} else {
				manualTests.push(item);
			}
		});

		let finalAT = [];
		let finalMT = [];
		autoTests.forEach((item) => {
			let it = {};
			it['name'] = item.name;
			it['displayname'] = item.displayname;
			it['category'] = item.category;
			it['severity'] = item.severity;
			it['status'] = item.status;
			it['testCode'] = item.testCode;

			finalAT.push(it);
		});
		manualTests.forEach((item) => {
			let it = {};
			it['name'] = item.name;
			it['displayname'] = item.displayname;
			it['category'] = item.category;
			it['severity'] = item.severity;
			it['status'] = item.status;
			it['testCode'] = item.testCode;

			finalMT.push(it);
		});

		if (
			finalAT.length === autoTests.length &&
			finalMT.length === manualTests.length
		) {
			categoryObject['autoTests'] = finalAT;
			categoryObject['manualTests'] = finalMT;
			return categoryObject;
		}
	};

	if (req.body.transactionName === 'VerifyDevice') {
		const verify_category = filtered('VerifyDevice');
		const check_category = filtered('checkMyDevice');
		category.push(verify_category);
		data['category'] = category;
		data['checkMyDevice'] = check_category;
	} else if (req.body.transactionName == 'BuyerVerification') {
		const buyer_category = filtered('BuyerVerification');
		const check_category = filtered('checkMyDevice');
		category.push(buyer_category);
		data['category'] = category;
		data['checkMyDevice'] = check_category;
	} else {
		const run_all_category = filtered('RunAllDiagnostics');
		const check_category = filtered('checkMyDevice');
		category.push(run_all_category);
		data['category'] = category;
		data['checkMyDevice'] = check_category;
	}

	const getMarketingName = async (make, model) => {
		try {
			let Object = await gsmarenaModal.aggregate([{ $match: { make: make } }]);

			let modelName = '';
			let makeArray = Object[0][make];
			makeArray.forEach((item, index) => {
				let keys = [];
				for (let key in item) {
					if (key !== '_id') keys.push(key);
				}
				keys.forEach((key, i) => {
					let mKeys = [];
					for (let mKey in item[key]['Misc']) {
						mKeys.push(mKey);
					}
					mKeys.forEach((newKey, j) => {
						if (
							newKey.includes('Models') &&
							item[key]['Misc']['Models'].includes(model)
						) {
							modelName = key;
						}
					});
				});
			});
			return modelName;
		} catch (error) {
			console.log('error', error);
		}
	};

	const getMarketingNameResult = await getMarketingName(make, model);
	let today = new Date();
	let hours = today.getHours() * 3600000;
	let minutes = today.getMinutes() * 60000;
	let seconds = today.getSeconds() * 1000;

	let miliseconds = hours + minutes + seconds;

	data['physicalTests'] = physicalTests;
	data['marketingName'] = getMarketingNameResult;
	data['certified'] = false;
	data['autobrightnessAvl'] = true;
	data['ownershipCheckProceed'] = true;
	data['deviceSupported'] = true;
	data['latestFirmware'] = true;
	data['runAllManualTests'] = false;
	data['latestFirmwareVersion'] = latestFirmwareVersion;
	data['callTestNumber'] = '121';
	data['pkeys'] = 'VOLUME_UP,VOLUME_DOWN,POWER'; // TODO: Need to update according to the device
	data['vkeys'] = 'BACK,HOME,MENU'; // TODO: Need to update according to the device
	data['iosBatteryHealthPer'] = platform === 'Android' ? -1 : 100;
	data['sessionTimeoutInMins'] = 30;
	data['iosBatteryHealthStatus'] = platform === 'Android' ? 'SKIPPED' : 'PASS';
	data['batteryDesignCapacity'] = batteryDesignCapacityQuick;
	data['lastRestartThresholdDays'] = Math.ceil(lastRestart / 86400000);
	data['unusedAppsThreshold'] = '5';
	data['currentServerTime'] = miliseconds;
	data['shortDateFormat'] = 'dd/MM/yyyy';
	data['longDateFormat'] = 'dd/MM/yyyy HH:mm';
	data['sohRange'] = [79, 90]; //TODO: Need to update according to the device and the battery design capacity
	data['fivePointCheck'] = [];
	data['generateRAN'] = false;
	data['enableRAPFeature'] = false;
	data['storeemail'] = 'aman@zenro.co.jp';
	data['countryemail'] = 'aman@zenro.co.jp';
	data['sendSummaryToStoreAndCentral'] = false;
	data['batteryConfig'] = {
		sohThreshold: 80,
		avgSohThreshold: 60,
		validSohThreshold: 5,
		deepdiveConfig: {
			percentDrop: 3,
			minBatteryLevel: 30,
		},
		gldProfile: 'aaa',
	};
	data['serverWARVersion'] = 'SSD-3.2.20211014.3';
	data['summaryDisplayElements'] = [
		'SuggestedFixes',
		'DeviceInfo',
		'BatteryTest',
		'TestResults',
	];
	data['hybridTests'] = [];
	data['checkIMEIStolenStatus'] = true;
	data['enableEmailSummary'] = true;
	data['enableCSAT'] = true;
	data['enableIMEICapture'] = true;
	data['enableCosmeticCheck'] = false;
	data['enableCosmeticMirrorCheck'] = false;
	data['enableTradeInFlow'] = false;
	data['disableDiagIssuesSelection'] = false;
	data['disableSkipManualTestsOption'] = false;
	data['enableDiagTradeInFlow'] = false;

	const diagnosticsData = { ...req.body, sessionId: randomNumber };
	const saveDiagnosticsData = new dignosticsConfigModal(diagnosticsData);
	try {
		// const givedSavedData = await saveDiagnosticsData.save();
		res.status(201).json({
			data: data,
			status: 'SUCCESS',
			message: 'Valid store id',
			sessionId: parseInt(randomNumber),
			// statusCode: 201,
		});
		return;
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/diagConfigIOS', async (req, res) => {
	const randomNumber = generateRandomNumber();
	let diagnosticsDataObject = await diagnosticsAllTests.find();

	let allTest = diagnosticsDataObject[0]['allTests'];
	let allDescriptions = diagnosticsDataObject[0]['allDescriptions'];
	let allTestCategory = diagnosticsDataObject[0]['allTestCategory'][0];

	// let data = {};
	// let category = [];
	// TODO: Physical test will be added soon in the future
	let physicalTests = [];
	let unavailableFeatures = req.body.unavailableFeatures;
	let make = req.body.make;
	let model = req.body.model;
	let latestFirmwareVersion = req.body.firmware; //TODO: Need to get the latest firmware version every time
	let platform = req.body.platform;
	let batteryDesignCapacityQuick = req.body.batteryDesignCapacityQuick;
	let lastRestart = req.body.lastRestart;

	let data = {};
	data['category'] = [
		{
			issueName: 'RunAllDiagnostics',
			displayname: 'Full Diagnostics',
			description: 'Run all checks on the device.',
			autoTests: [
				{
					name: 'GyroscopeSensorTest',
					displayname: 'Gyroscope',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT054',
				},
				{
					name: 'MagneticSensorTest',
					displayname: 'Magnetic Sensor',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT055',
				},
				{
					name: 'GameRotationSensorTest',
					displayname: 'Game Rotation Sensor',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT123',
				},
				{
					name: 'GeomagneticRotationSensorTest',
					displayname: 'Geomagnetic Rotation Sensor',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT124',
				},
				{
					name: 'RotationVectorSensorTest',
					displayname: 'Rotation Vector Sensor',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT125',
				},
				{
					name: 'LinearAccelerationSensorTest',
					displayname: 'Linear Acceleration Sensor',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT127',
				},
				{
					name: 'GenuineOSTest',
					displayname: 'Genuine OS',
					category: 'OS',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT010',
				},
				{
					name: 'LastRestart',
					displayname: 'Last Restart ',
					category: 'OS',
					severity: 'LOW',
					status: 'OPTIMIZABLE',
					testCode: 'PT034',
				},
				{
					name: 'UnusedApp',
					displayname: 'Unused Apps',
					category: 'Apps',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT064',
				},
				{
					name: 'InternalStorageCapacityTest',
					displayname: 'Int. Storage Capacity',
					category: 'Storage',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT071',
				},
				{
					name: 'RAMMemoryTest',
					displayname: 'RAM Memory Capacity',
					category: 'Storage',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT161',
				},
				{
					name: 'SDCardTest',
					displayname: 'SD Card Memory Capacity',
					category: 'Storage',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT162',
				},
				{
					name: 'SIMCardTest',
					displayname: 'SIM Card',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT016',
				},
				{
					name: 'ScreenBrightnesTest',
					displayname: 'Brightness',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT038',
				},
				{
					name: 'LiveWallpaperTest',
					displayname: 'Live Wallpaper',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT039',
				},
				{
					name: 'ScreenTimeoutTest',
					displayname: 'Screen Timeout',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT037',
				},
				{
					name: 'BarometerTest',
					displayname: 'Barometer',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT056',
				},
				{
					name: 'BluetoothOnTest',
					displayname: 'Bluetooth Ready',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT044',
				},
				{
					name: 'BluetoothOffTest',
					displayname: 'Bluetooth Status',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT045',
				},
				{
					name: 'GPSOffTest',
					displayname: 'GPS Status',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT049',
				},
				{
					name: 'NFCOffTest',
					displayname: 'NFC Status',
					category: 'Settings',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT047',
				},
				{
					name: 'BluetoothToggleTest',
					displayname: 'Bluetooth',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT025',
				},
				{
					name: 'QuickBatteryAutoTest',
					displayname: 'Battery',
					category: 'Hardware',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT093',
				},
				{
					name: 'VibrationTest',
					displayname: 'Vibration',
					category: 'Others',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT021',
				},
				{
					name: 'RearCameraPictureTest',
					displayname: 'Rear camera',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT026',
				},
				{
					name: 'FrontCameraPictureTest',
					displayname: 'Front camera',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT028',
				},
				{
					name: 'AccelerometerTest',
					displayname: 'Accelerometer',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT018',
				},
				{
					name: 'SpeakerTest',
					displayname: 'Speaker',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT019',
				},
				{
					name: 'EarpieceTest',
					displayname: 'Earpiece',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT020',
				},
				{
					name: 'MicTest',
					displayname: 'Microphone (Primary)',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT031',
				},
				{
					name: 'Mic2Test',
					displayname: 'Microphone (Secondary)',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT128',
				},
			],
			manualTests: [
				{
					name: 'LCDTest',
					displayname: 'Display',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT082',
				},
				{
					name: 'DimmingTest',
					displayname: 'Dimming',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT012',
				},
				{
					name: 'ProximityTest',
					displayname: 'Proximity',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT017',
				},
				{
					name: 'LightSensorTest',
					displayname: 'Ambient light',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT084',
				},
				{
					name: 'TouchTest',
					displayname: 'Touch',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT011',
				},
				{
					name: 'HardKeysTest',
					displayname: 'Hard Keys Test',
					category: 'Keys',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT151',
				},
				{
					name: 'SoftKeysTest',
					displayname: 'Soft Keys Test',
					category: 'Keys',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT152',
				},
				{
					name: 'CallTest',
					displayname: 'Call Test',
					category: 'System',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT153',
				},
				{
					name: 'DeadPixelTest',
					displayname: 'Dead Pixel Test',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT154',
				},
				{
					name: 'DiscolorationTest',
					displayname: 'Discoloration Test',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT155',
				},
				{
					name: 'ScreenBurnTest',
					displayname: 'Screen Burn Test',
					category: 'Display',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT156',
				},
				{
					name: 'EarphoneJackTest',
					displayname: 'Earjack',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT077',
				},
				{
					name: 'EarphoneTest',
					displayname: 'Earphone',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT076',
				},
				{
					name: 'CameraFlashTest',
					displayname: 'Camera flash',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT030',
				},
				{
					name: 'FrontFlashTest',
					displayname: 'Front Flash Test',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT157',
				},
				{
					name: 'USBManualConnectionTest',
					displayname: 'USB connection',
					category: 'Others',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT060',
				},
				{
					name: 'WallChargingTest',
					displayname: 'Charging',
					category: 'Others',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT061',
				},
				{
					name: 'VibrationTest',
					displayname: 'Vibration',
					category: 'Others',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT021',
				},
				{
					name: 'RearCameraPictureTest',
					displayname: 'Rear camera',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT026',
				},
				{
					name: 'FrontCameraPictureTest',
					displayname: 'Front camera',
					category: 'Camera',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT028',
				},
				{
					name: 'SpeakerTest',
					displayname: 'Speaker',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT019',
				},
				{
					name: 'EarpieceTest',
					displayname: 'Earpiece',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT020',
				},
				{
					name: 'MicTest',
					displayname: 'Microphone (Primary)',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT031',
				},
				{
					name: 'Mic2Test',
					displayname: 'Microphone (Secondary)',
					category: 'Audio',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT128',
				},
				{
					name: 'FingerPrintSensorTest',
					displayname: 'Finger print sensor',
					category: 'Sensors',
					severity: 'LOW',
					status: 'NONE',
					testCode: 'PT085',
				},
			],
		},
	];

	data['checkMyDevice'] = {
		issueName: 'CheckMyDevice',
		displayname: 'asd.flow.name.checkmydevice',
		description: 'asd.flow.desc.checkmydevice',
		autoTests: [
			{
				name: 'InternalStorageCapacityTest',
				displayname: 'Int. Storage Capacity',
				category: 'Storage',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT071',
			},
			{
				name: 'RAMMemoryTest',
				displayname: 'RAM Memory Capacity',
				category: 'Storage',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT161',
			},
			{
				name: 'SDCardTest',
				displayname: 'SD Card Memory Capacity',
				category: 'Storage',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT162',
			},
			{
				name: 'LastRestart',
				displayname: 'Last Restart ',
				category: 'OS',
				severity: 'LOW',
				status: 'PASS',
				testCode: 'PT034',
			},
			{
				name: 'SIMCardTest',
				displayname: 'SIM Card',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT016',
			},
			{
				name: 'GenuineOSTest',
				displayname: 'Genuine OS',
				category: 'OS',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT010',
			},
			{
				name: 'IMEITest',
				displayname: 'IMEI Test',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT032',
			},
			{
				name: 'BarometerTest',
				displayname: 'Barometer',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT056',
			},
			{
				name: 'MagneticSensorTest',
				displayname: 'Magnetic Sensor',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT055',
			},
			{
				name: 'BluetoothOffTest',
				displayname: 'Bluetooth Status',
				category: 'Settings',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT045',
			},
			{
				name: 'GPSOffTest',
				displayname: 'GPS Status',
				category: 'Settings',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT049',
			},
			{
				name: 'BluetoothToggleTest',
				displayname: 'Bluetooth',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT025',
			},
			{
				name: 'GyroscopeSensorTest',
				displayname: 'Gyroscope',
				category: 'Hardware',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT054',
			},
			{
				name: 'RearCameraPictureTest',
				displayname: 'Rear camera',
				category: 'Camera',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT026',
			},
		],
		manualTests: [
			{
				name: 'LCDTest',
				displayname: 'Display',
				category: 'Display',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT082',
			},
			{
				name: 'DimmingTest',
				displayname: 'Dimming',
				category: 'Display',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT012',
			},
			{
				name: 'TouchTest',
				displayname: 'Touch',
				category: 'Display',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT011',
			},
			{
				name: 'AccelerometerTest',
				displayname: 'Accelerometer',
				category: 'Sensors',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT018',
			},
			{
				name: 'ProximityTest',
				displayname: 'Proximity',
				category: 'Sensors',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT017',
			},
			{
				name: 'SpeakerTest',
				displayname: 'Speaker',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT019',
			},
			{
				name: 'EarpieceTest',
				displayname: 'Earpiece',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT020',
			},
			{
				name: 'MicTest',
				displayname: 'Microphone (Primary)',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT031',
			},
			{
				name: 'Mic2Test',
				displayname: 'Microphone (Secondary)',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT128',
			},
			{
				name: 'EarphoneTest',
				displayname: 'Earphone',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT076',
			},
			{
				name: 'EarphoneJackTest',
				displayname: 'Earjack',
				category: 'Audio',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT077',
			},
			{
				name: 'VibrationTest',
				displayname: 'Vibration',
				category: 'Others',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT021',
			},
			{
				name: 'RearCameraVideoTest',
				displayname: 'Rear camera video',
				category: 'Camera',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT027',
			},
			{
				name: 'FrontCameraPictureTest',
				displayname: 'Front camera',
				category: 'Camera',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT028',
			},
			{
				name: 'FrontCameraVideoTest',
				displayname: 'Front camera video',
				category: 'Camera',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT029',
			},
			{
				name: 'CameraFlashTest',
				displayname: 'Camera flash',
				category: 'Camera',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT030',
			},
			{
				name: 'USBManualConnectionTest',
				displayname: 'USB connection',
				category: 'Others',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT060',
			},
			{
				name: 'FingerPrintSensorTest',
				displayname: 'Finger print sensor',
				category: 'Sensors',
				severity: 'LOW',
				status: 'NONE',
				testCode: 'PT085',
			},
		],
	};

	let today = new Date();
	let hours = today.getHours() * 3600000;
	let minutes = today.getMinutes() * 60000;
	let seconds = today.getSeconds() * 1000;

	let miliseconds = hours + minutes + seconds;

	data['physicalTests'] = [];
	data['marketingName'] = 'Apple Phone';
	data['certified'] = false;
	data['autobrightnessAvl'] = true;
	data['ownershipCheckProceed'] = true;
	data['deviceSupported'] = true;
	data['latestFirmware'] = true;
	data['runAllManualTests'] = false;
	data['latestFirmwareVersion'] = latestFirmwareVersion;
	data['callTestNumber'] = '121';
	data['pkeys'] = 'VOLUME_UP,VOLUME_DOWN,POWER'; // TODO: Need to update according to the device
	data['vkeys'] = 'BACK,HOME,MENU'; // TODO: Need to update according to the device
	data['iosBatteryHealthPer'] = platform === 'Android' ? -1 : 100;
	data['sessionTimeoutInMins'] = 30;
	data['iosBatteryHealthStatus'] = platform === 'Android' ? 'SKIPPED' : 'PASS';
	data['batteryDesignCapacity'] = batteryDesignCapacityQuick;
	data['lastRestartThresholdDays'] = Math.ceil(lastRestart / 86400000);
	data['unusedAppsThreshold'] = '5';
	data['currentServerTime'] = miliseconds;
	data['shortDateFormat'] = 'dd/MM/yyyy';
	data['longDateFormat'] = 'dd/MM/yyyy HH:mm';
	data['sohRange'] = [79, 90]; //TODO: Need to update according to the device and the battery design capacity
	data['fivePointCheck'] = [];
	data['generateRAN'] = false;
	data['enableRAPFeature'] = false;
	data['storeemail'] = 'nishant.sharma@zenro.co.jp';
	data['countryemail'] = 'nishant.sharma@zenro.co.jp';
	data['sendSummaryToStoreAndCentral'] = false;
	data['batteryConfig'] = {
		sohThreshold: 80,
		avgSohThreshold: 60,
		validSohThreshold: 5,
		deepdiveConfig: {
			percentDrop: 3,
			minBatteryLevel: 30,
		},
		gldProfile: 'aaa',
	};
	data['serverWARVersion'] = 'SSD-3.2.20211014.3';
	data['summaryDisplayElements'] = [
		'SuggestedFixes',
		'DeviceInfo',
		'BatteryTest',
		'TestResults',
	];
	data['hybridTests'] = [];
	data['checkIMEIStolenStatus'] = true;
	data['enableEmailSummary'] = true;
	data['enableCSAT'] = true;
	data['enableIMEICapture'] = true;
	data['enableCosmeticCheck'] = false;
	data['enableCosmeticMirrorCheck'] = false;
	data['enableTradeInFlow'] = false;
	data['disableDiagIssuesSelection'] = false;
	data['disableSkipManualTestsOption'] = false;
	data['enableDiagTradeInFlow'] = false;

	const diagnosticsData = { ...req.body, sessionId: randomNumber };
	const saveDiagnosticsData = new dignosticsConfigModal(diagnosticsData);
	try {
		res.status(201).json({
			data: data,
			status: 'SUCCESS',
			message: 'Valid store id',
			sessionId: parseInt(randomNumber),
		});
		return;
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

const severityLow = [
	'RotationVectorSensorTest',
	'BarometerTest',
	'MagneticSensorTest',
	'LinearAccelerationSensorTest',
	'GeomagneticRotationSensorTest',
	'AccelerometerTest',
	'FingerPrintSensorTest',
];
const severityMedium = [
	'VibrationTest',
	'BluetoothOffTest',
	'BluetoothOnTest',
	'BluetoothToggleTest',
	'QuickBatteryAutoTest',
	'WLANOnTest',
	'GameRotationSensorTest',
	'GyroscopeSensorTest',
	'Mic2Test',
	'LCDTest',
	'DimmingTest',
	'ProximityTest',
	'LightSensorTest',
	'DeadPixelTest',
	'DiscolorationTest',
	'ScreenBurnTest',
	'EarphoneJackTest',
	'EarphoneTest',
	'CameraFlashTest',
	'FrontFlashTest',
];
const severityHigh = [
	'WallChargingTest',
	'GenuineOSTest',
	'SpeakerTest',
	'FrontCameraPictureTest',
	'EarpieceTest',
	'RearCameraPictureTest',
	'MicTest',
	'RearCameraVideoTest',
	'FrontCameraVideoTest',
	'TouchTest',
	'HardKeysTest',
	'USBManualConnectionTest',
];

router.post('/grade/price', is_Session, logEvent, async (req, res) => {
	const functionalTestResults = req.body.functionalTestResults;
	const listingId = req.body.listingId;
	const deviceUniqueId = req.body.deviceUniqueId;
	const ram = req.body.ram;
	const buyerCondition = req.body.buyerCondition;
	const saveData = req.body.saveData;

	try {
		if (saveData == 'Y') {
			// disableSameListing(deviceUniqueId, req.body.marketingName);
			let disableListing = await saveListingModal.updateMany(
				{
					deviceUniqueId: deviceUniqueId,
					marketingName: req.body.marketingName,
					// status: "Active",
				},
				{ status: 'Expired', deviceUniqueId: '', verified: false }
			);
			// also change in bestDealModal
			let disableBestDeal = await bestDealsModal.updateMany(
				{
					deviceUniqueId: deviceUniqueId,
					marketingName: req.body.marketingName,
					// status: "Active",
				},
				{ status: 'Sold_Out', deviceUniqueId: '', verified: false }
			);
		}
		let grade;
		let cosmeticGrade;
		let finalGrade;
		let condition;
		let count = 0;
		let lCount = 0;
		let index = 0;

		// const getQuestions = await questionModal.find({});

		for (item of functionalTestResults) {
			if (severityHigh.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					//!== "PASS"
					// grade = "C";
					grade = 'D';
					// condition = "Fair";
					condition = 'Needs Repair';
					break;
				}
			} else if (severityMedium.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					if (count <= 3) {
						// grade = "B";
						// condition = "Good";
						grade = 'C';
						condition = 'Fair';
						count++;
					} else {
						grade = 'D';
						condition = 'Needs Repair';
						count = 0;
						break;
					}
				}
			} else if (severityLow.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					if (lCount <= 3) {
						grade = 'A';
						condition = 'Excellent';
					} else {
						grade = 'B';
						condition = 'Good';
						break;
					}
					lCount++;
				}
			}
			index++;
			if (
				index >= functionalTestResults.length &&
				count === 0 &&
				lCount === 0
			) {
				grade = 'S';
				condition = 'Like New';
				break;
			}
		}

		let warrantyPeriod;

		const listing = await saveListingModal.findOne({ listingId: listingId });

		if (saveData == 'Y') {
			let findDevice = await deviceIdModal.findOne({
				deviceUniqueId: deviceUniqueId,
			});

			if (!findDevice) {
				let saveDevice = new deviceIdModal({
					deviceUniqueId: deviceUniqueId,
					listingId: listingId,
					verifiedOn: new Date(),
					attachedTo: listing.associatedWith || '',
					payStatus:
						listing.associatedWith && listing.associatedWith != '' ? 'Y' : 'N',
				});
				await saveDevice.save();
			}
		}
		let cosmetic = listing.cosmetic;
		let deviceAge = listing.warranty;

		if (deviceAge === 'More than 9 months') {
			warrantyPeriod = 'zero';
		} else if (deviceAge === 'More than 6 months') {
			warrantyPeriod = 'four';
		} else if (deviceAge === 'More than 3 months') {
			warrantyPeriod = 'seven';
		} else if (deviceAge === 'None') {
			warrantyPeriod = 'more';
		}

		if (!cosmetic || cosmetic[0].toString().includes('No')) {
			cosmeticGrade = 'D';
		} else {
			if (
				cosmetic[1].toString().includes('Has significant') ||
				cosmetic[2].toString().includes('Has significant')
			) {
				cosmeticGrade = 'C';
			} else if (
				cosmetic[1].toString().includes('Up to 5') ||
				cosmetic[2].toString().includes('Up to 5')
			) {
				cosmeticGrade = 'B';
			} else if (
				cosmetic[1].toString().includes('Up to 2') ||
				cosmetic[2].toString().includes('Up to 2')
			) {
				cosmeticGrade = 'A';
			} else if (
				cosmetic[1].toString().includes('No scratch') &&
				cosmetic[2].toString().includes('No scratch')
			) {
				cosmeticGrade = 'S';
			}
		}

		if (grade === 'S' && cosmeticGrade === 'S') {
			finalGrade = 'S';
		} else if (grade === 'S' && cosmeticGrade !== 'S') {
			finalGrade = cosmeticGrade;
		} else if (grade !== 'S' && cosmeticGrade === 'S') {
			finalGrade = grade;
		} else {
			if (grade > cosmeticGrade) {
				finalGrade = grade;
			} else if (grade <= cosmeticGrade) {
				finalGrade = cosmeticGrade;
			}
		}

		if (finalGrade === 'S') {
			condition = 'Like New';
		} else if (finalGrade === 'A') {
			condition = 'Excellent';
		} else if (finalGrade === 'B') {
			condition = 'Good';
		} else if (finalGrade === 'C') {
			condition = 'Fair';
		} else if (finalGrade === 'D') {
			condition = 'Needs Repair';
		}

		if (saveData == 'N' && buyerCondition != null) {
			if (condition != buyerCondition) {
				if (buyerCondition == 'Needs Repair' || grade == 'D') {
					condition = 'Needs Repair';
				} else if (buyerCondition == 'Fair' || grade == 'C') {
					condition = 'Fair';
				} else if (buyerCondition == 'Good' || grade == 'B') {
					condition = 'Good';
				} else if (buyerCondition == 'Excellent' || grade == 'A') {
					condition = 'Excellent';
				} else if (buyerCondition == 'Like New' || grade == 'S') {
					condition = 'Like New';
				}
			}
		}

		if (condition == 'Like New') {
			switch (warrantyPeriod) {
				case 'four':
					condition = 'Excellent';
					break;
				case 'seven':
					condition = 'Excellent';
					break;
				case 'more':
					condition = 'Good';
					break;
				default:
					condition = condition;
					break;
			}
		} else if (condition == 'Excellent') {
			switch (warrantyPeriod) {
				case 'more':
					condition = 'Good';
					break;
				default:
					condition = condition;
					break;
			}
		}
		// else if (condition == "Good") {
		//   switch (warrantyPeriod) {
		//     case "more":
		//       condition = "Fair";
		//       break;
		//     default:
		//       condition = condition;
		//       break;
		//   }
		// }

		const now = new Date();
		const dateFormat = moment(now).format('MMM Do');

		const dataToBeUpdate = {
			deviceFunctionalGrade: grade,
			functionalTestResults: req.body.functionalTestResults,
			questionnaireResults: [],
			deviceCosmeticGrade: cosmeticGrade,
			deviceFinalGrade: finalGrade,
			verified: true,
			status: 'Active',
			verifiedDate: dateFormat,
			deviceCondition: condition,
			deviceUniqueId: deviceUniqueId,
			deviceStorage: req.body.storage,
		};

		if (!listing) {
			res.status(200).json({
				reason: 'Listing not found',
				statusCode: 200,
				status: 'SUCCESS',
			});
		} else {
			if (saveData === 'Y') {
				const updatedListing = await saveListingModal.findByIdAndUpdate(
					listing._id,
					dataToBeUpdate,
					{
						new: true,
					}
				);

				let dataObject2 = await bestDealsModal.findOneAndUpdate(
					{ listingId: updatedListing.listingId },
					dataToBeUpdate,
					{
						new: true,
					}
				);
			}
		}

		const make = req.body.make;
		const marketingname = req.body.marketingName;
		const storage = req.body.storage;
		const hasCharger = listing.charger === 'Y' ? true : false;
		const isAppleChargerIncluded = make === 'Apple' ? hasCharger : false;
		const hasEarphone = listing.earphone === 'Y' ? true : false;
		const isAppleEarphoneIncluded = make === 'Apple' ? hasEarphone : false;
		const hasOrignalBox = listing.originalbox === 'Y' ? true : false;
		const isVarified = true;

		const oldPrice = await getRecommendedPrice(
			listing.make,
			listing.marketingName,
			listing.deviceCondition,
			listing.deviceStorage,
			listing.deviceRam,
			listing.charger === 'Y' ? true : false,
			listing.make === 'Apple'
				? listing.charger === 'Y'
					? true
					: false
				: false,
			listing.earphone === 'Y' ? true : false,
			listing.make === 'Apple'
				? listing.earphone === 'Y'
					? true
					: false
				: false,
			listing.originalbox === 'Y' ? true : false,
			listing.verified,
			false,
			warrantyPeriod
		);

		const price = await getRecommendedPrice(
			make,
			marketingname,
			condition,
			storage,
			ram,
			hasCharger,
			isAppleChargerIncluded,
			hasEarphone,
			isAppleEarphoneIncluded,
			hasOrignalBox,
			isVarified,
			false,
			warrantyPeriod
		);

		const dataObject = {};
		dataObject['minPrice'] = price.leastSellingprice ?? '-';
		dataObject['maxPrice'] = price.maxsellingprice ?? '-';
		dataObject['oldMinPrice'] = oldPrice.leastSellingprice ?? '-';
		dataObject['oldMaxPrice'] = oldPrice.maxsellingprice ?? '-';
		dataObject['grade'] = finalGrade;
		dataObject['functionalGrade'] = grade;
		dataObject['cosmaticGrade'] = cosmeticGrade;
		dataObject['condition'] = condition;
		// dataObject["finalQuestionArray"] = finalQuestionArray;
		res.status(200).json({
			reason: 'Listing updated successfully',
			statusCode: 201,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.post('/grade/recommended/price', async (req, res) => {
	try {
		let functionalTestResults = req.body.functionalTestResults;
		let make = req.body.make;
		let marketingName = req.body.marketingName;
		let storage = req.body.storage;
		let ram = req.body.ram;
		let deviceCondition = req.body.deviceCondition;
		let deviceUniqueId = req.body.deviceUniqueId;

		// this api endpoint is similar as above but it only calculate the price, grade and condition and return it to the user without updating the listing

		let grade = '';
		let cosmeticGrade = '';
		let finalGrade = '';
		let condition = '';
		let count = 0;
		let lCount = 0;
		let index = 0;

		for (item of functionalTestResults) {
			if (severityHigh.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					//!== "PASS"
					// grade = "C";
					grade = 'D';
					// condition = "Fair";
					condition = 'Needs Repair';
					break;
				}
			} else if (severityMedium.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					if (count <= 3) {
						// grade = "B";
						// condition = "Good";
						grade = 'C';
						condition = 'Fair';
						count++;
					} else {
						grade = 'D';
						condition = 'Needs Repair';
						count = 0;
						break;
					}
				}
			} else if (severityLow.includes(item.commandName)) {
				if (item.testStatus == 'FAIL') {
					if (lCount <= 3) {
						grade = 'A';
						condition = 'Excellent';
					} else {
						grade = 'B';
						condition = 'Good';
						break;
					}
					lCount++;
				}
			}
			index++;
			if (
				index >= functionalTestResults.length &&
				count === 0 &&
				lCount === 0
			) {
				grade = 'S';
				condition = 'Like New';
				break;
			}
		}

		switch (deviceCondition) {
			case 'Like New':
				cosmeticGrade = 'S';
				break;
			case 'Excellent':
				cosmeticGrade = 'A';
				break;
			case 'Good':
				cosmeticGrade = 'B';
				break;
			case 'Fair':
				cosmeticGrade = 'C';
				break;
			case 'Needs Repair':
				cosmeticGrade = 'D';
				break;
			default:
				cosmeticGrade = 'B';
				break;
		}

		if (grade === 'S' && cosmeticGrade === 'S') {
			finalGrade = 'S';
		} else if (grade === 'S' && cosmeticGrade !== 'S') {
			finalGrade = cosmeticGrade;
		} else if (grade !== 'S' && cosmeticGrade === 'S') {
			finalGrade = grade;
		} else {
			if (grade > cosmeticGrade) {
				finalGrade = grade;
			} else if (grade <= cosmeticGrade) {
				finalGrade = cosmeticGrade;
			}
		}

		if (finalGrade === 'S') {
			condition = 'Like New';
		} else if (finalGrade === 'A') {
			condition = 'Excellent';
		} else if (finalGrade === 'B') {
			condition = 'Good';
		} else if (finalGrade === 'C') {
			condition = 'Fair';
		} else if (finalGrade === 'D') {
			condition = 'Needs Repair';
		}

		const price = await getRecommendedPrice(
			make,
			marketingName,
			deviceCondition,
			storage,
			ram,
			true,
			make === 'Apple' ? true : false,
			true,
			make === 'Apple' ? true : false,
			true,
			true,
			false,
			'zero'
		);

		console.log('price', price);

		const dataObject = {
			grade: finalGrade,
			condition: condition,
			price: `₹${price.leastSellingprice ?? '-'} - ₹${
				price.maxsellingprice ?? '-'
			}`,
			message: `The recommended price for this device is: `,
		};

		res.status(200).json({
			reason: 'Price calculated successfully',
			statusCode: 201,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		res.status(200).json({
			reason: 'Price calculation failed',
			statusCode: 200,
			status: 'FAILED',
			dataObject: {
				error: error,
			},
		});
	}
});

router.post('/logDiagTransaction',is_Session, async (req, res) => {
	try {
		console.log(req.sessionID)
		const getLogData = await dignosticsLogsModal.find({
			sessionId: req.sessionID
		});

		if (getLogData.length > 0) {
			const updateLogData = await dignosticsLogsModal.updateOne(
				{ sessionId: req.sessionID },
				{
					$set: {
						...req.body,
					},
				}
			);
			res.status(200).json({
				message: 'Logs updated successfully',
				sessionId: req.sessionID,
				status: 'SUCCESS',
				data: updateLogData || {},
			});
		} else {
			const saveLogData = await dignosticsLogsModal.create({
				...req.body,
			});
			res.status(200).json({
				reason: 'Logs saved successfully',
				status: 'SUCCESS',
				sessionId: req.sessionID,
				data: saveLogData || {},
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/getDiagLogs', async (req, res) => {
	try {
		const getLogData = await dignosticsLogsModal.find({
			sessionId: req.sessionID,
		});

		if (getLogData.length > 0) {
			res.status(200).json({
				reason: 'Logs found successfully',
				statusCode: 200,
				status: 'SUCCESS',
				data: getLogData,
			});
		} else {
			res.status(200).json({
				reason: 'Logs not found',
				statusCode: 200,
				status: 'SUCCESS',
				data: [],
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;