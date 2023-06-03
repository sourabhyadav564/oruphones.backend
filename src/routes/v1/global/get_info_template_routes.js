const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

require('@/database/connection');
const logEvent = require('@/middleware/event_logging');
const saveListingModal = require('@/database/modals/device/save_listing_device');
const validUser = require('@/middleware/valid_user');

router.get('/getinfotemplates', validUser, logEvent, async (req, res) => {
	try {
		let dataObject = {};
		dataObject['serverUrl'] = process.env.SERVER_URL;
		dataObject['templateUrls'] = {
			VERIFICATION: '/new_verification.html',
			CONDITIONS: '/new_condition.html',
			TERMS_CONDITIONS: '/terms_conditions.html',
			FAQ: '/new_faq.html',
			ABOUT_US: '/about-us.html',
			WARRANTY: '/warranty.html',
			PRIVACY: '/new_privacy-policy.html',
			APPLE_STORAGE: '/apple_storage_check.html',
			ANDROID_STORAGE: '/android_storage_check.html',
			HOW_TO_BUY: '/#how_to_buy',
			HOW_TO_SELL: '/#how_to_sell',
		};
		res.status(200).json({
			reason: 'Templet link generated successfully',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
