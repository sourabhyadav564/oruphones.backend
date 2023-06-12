const express = require('express');
const router = express.Router();
// const connection = require("@/database/mysql_connection");
const fs = require('fs');
const logEvent = require('@/middleware/event_logging');
const validUser = require('@/middleware/valid_user');

const getRecommendedPrice = require('@/utils/get_recommended_price');

router.post('/recomanded/price', validUser, logEvent, async (req, res) => {
	try {
		const make = req.body.make;
		const marketingname = req.body.marketingName;
		let condition = req.body.deviceCondition;
		// const storage = req.body.devicestorage.split(" ")[0].toString();
		const storage = req.body.devicestorage;
		const ram = req.body.deviceRam;
		const hasCharger = req.body.charger === 'Y' ? true : false;
		const isAppleChargerIncluded = make === 'Apple' ? hasCharger : false;
		const hasEarphone = req.body.earPhones === 'Y' ? true : false;
		const isAppleEarphoneIncluded = make === 'Apple' ? hasEarphone : false;
		const hasOrignalBox = req.body.originalBox === 'Y' ? true : false;
		const isVarified = req.body.verified === 'no' ? false : true;
		const warrantyPeriod = req.body.warrantyPeriod;
		// fs.writeFileSync(`scrapped.json`, JSON.stringify(scrappedModels));
		// fs.writeFileSync(`models.json`, JSON.stringify(models));

		if (condition == 'Like New') {
			switch (warrantyPeriod) {
				case 'four':
					deviceCondition = 'Excellent';
					break;
				case 'seven':
					deviceCondition = 'Excellent';
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

		const recommendedPrice = await getRecommendedPrice(
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
		dataObject['leastSellingprice'] = recommendedPrice.leastSellingprice || '-';
		dataObject['maxsellingprice'] = recommendedPrice.maxsellingprice || '-';

		res.status(200).json({
			reason: 'Models Found Successfully',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject: dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;