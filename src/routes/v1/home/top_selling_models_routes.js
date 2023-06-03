const express = require('express');
const router = express.Router();

require('@/database/connection');
// const listingByMakeModal = require("@/database/modals/listing/listing_by_make");
const saveListingModal = require('@/database/modals/device/save_listing_device');
const logEvent = require('@/middleware/event_logging');
const { newModelImages } = require('@/utils/models_util');

router.get('/topselling/models', async (req, res) => {
	try {
		let isLimited = req.query.isLimited || 'true';

		switch (isLimited) {
			case 'true':
				isLimited = true;
				break;
			case true:
				isLimited = true;
				break;
			case 'false':
				isLimited = false;
				break;
			case false:
				isLimited = false;
				break;
			default:
				isLimited = true;
				break;
		}

		let dataObject = await saveListingModal.aggregate([
			{
				$group: {
					_id: '$marketingName',
					make: { $first: '$make' },
					marketingName: { $first: '$marketingName' },
					maxPrice: { $max: { $toInt: '$listingPrice' } },
					minPrice: { $min: { $toInt: '$listingPrice' } },

					// for maxPrice and minPrice, listingPrice is string & can contain . in it so we need to split it and then convert it to int
					// maxPrice: {
					//   $max: {
					//     $toInt: {
					//       $arrayElemAt: [{ $split: ["$listingPrice", "."] }, 0],
					//     },
					//   },
					// },
					// minPrice: {
					//   $min: {
					//     $toInt: {
					//       $arrayElemAt: [{ $split: ["$listingPrice", "."] }, 0],
					//     },
					//   },
					// },

					// imagePath: { $first: "$defaultImage.fullImage" },

					// imagePath: newModelImages[{ $toLower: { $first: "$marketingName" } }],

					displayOrder: { $first: 9999 },
					isTopSelling: { $first: false },
					quantity: { $sum: 1 },
				},
			},
			// addField for startingFrom
			{
				$addFields: {
					startingFrom: {
						$toString: { $min: '$minPrice' },
					},
				},
			},
			// now remove minPrice and maxPrice fields
			{
				$project: {
					minPrice: 0,
					maxPrice: 0,
				},
			},
			{ $sort: { quantity: -1 } },
			{ $limit: 50 },
		]);

		// now add imagePath to dataObject
		dataObject.map((item) => {
			let modelName = item.marketingName;
			modelName = modelName.toLowerCase().replace('+', ' plus');
			item.imagePath = newModelImages[modelName];
		});

		let allModels = [];
		if (!isLimited) {
			allModels = await saveListingModal.aggregate([
				{
					$group: {
						_id: '$marketingName',
						make: { $first: '$make' },
						marketingName: { $first: '$marketingName' },
						imagePath: { $first: '$defaultImage.fullImage' },
						displayOrder: { $first: 9999 },
						isTopSelling: { $first: false },
						quantity: { $sum: 1 },
					},
				},
				{ $sort: { quantity: -1 } },
			]);

			// now add imagePath to allModels
			allModels.map((item) => {
				let modelName = item.marketingName;
				modelName = modelName.toLowerCase().replace('+', ' plus');
				item.imagePath = newModelImages[modelName];
			});
		}

		res.status(200).json({
			reason: 'Listings by marketing name',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
			allModels,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;
