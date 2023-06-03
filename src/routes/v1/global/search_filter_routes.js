const express = require('express');
const searchFilterModal = require('@/database/modals/global/search_filter_modal');
const logEvent = require('@/middleware/event_logging');
const validUser = require('@/middleware/valid_user');
const router = express.Router();

router.post('/searchOld', validUser, logEvent, async (req, res) => {
	const userInputText = req.body.userInputText.toString().toLowerCase().trim();
	try {
		const resultData = await searchFilterModal.find({});
		let brandList = [];
		let results = [];
		let resultType = '';
		let marketingNameAndMakeMap = {};
		let dataObject = {};

		// we canntot use result data for direct accessing its objects.
		// Instead, we should have to use its resultData[0]. Inshort Index.

		if (resultData.length > 0) {
			resultData[0].make.filter((element, index) => {
				if (element.toLowerCase().includes(userInputText)) {
					if (brandList.length < 5) {
						brandList.push(element);
					}
				}
			});

			resultData[0].models.filter((element, index) => {
				if (element.toLowerCase().includes(userInputText)) {
					if (results.length < 50) {
						results.push(element);
					}
					if (brandList.length <= 1) {
						if (!brandList.includes(element.split(' ')[0])) {
							brandList.push(element.split(' ')[0]);
						}
					}
				}
			});

			if (brandList.length === 5) {
				resultType = 'make';
			} else {
				resultType = 'model';
			}

			results.forEach((element, index) => {
				marketingNameAndMakeMap[element] = element.split(' ')[0];
			});

			dataObject.brandList = brandList;
			dataObject.results = results;
			dataObject.resultType = resultType;
			dataObject.marketingNameAndMakeMap = marketingNameAndMakeMap;
			res.status(200).json({
				reason: 'Search suggestions fetched successfully',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.post('/search', validUser, logEvent, async (req, res) => {
	let userInputText = req.body.userInputText.toString().toLowerCase().trim();
	// remove multiple spaces
	userInputText = userInputText.replace(/\s+/g, ' ');
	try {
		let brandList = [];
		let results = [];
		let resultType = '';
		let marketingNameAndMakeMap = {};
		let dataObject = {};
		// const resultData = await searchFilterModal.find({});

		let newBrandList = await searchFilterModal
			.aggregate([
				{ $unwind: '$make' },
				{
					$match: {
						make: {
							$regex: new RegExp(userInputText.toLowerCase(), 'i'),
						},
					},
				},
				{ $group: { _id: '$make' } },
			])
			.limit(5)
			.exec();

		brandList = newBrandList.map((element) => {
			return element._id;
		});

		let newResults = await searchFilterModal
			.aggregate([
				{ $unwind: '$models' },
				{
					$match: {
						models: {
							// $regex: new RegExp(userInputText.toLowerCase(), "i"),
							$all: userInputText.split(' ').map((word) => {
								return new RegExp(word, 'i');
							}),
						},
					},
				},
				{ $group: { _id: '$models' } },
			])
			.limit(40)
			.exec();

		results = newResults.map((element) => {
			return element._id;
		});

		if (brandList.length <= 1 && results.length > 0) {
			if (!brandList.includes(results[0].split(' ')[0])) {
				brandList.push(results[0].split(' ')[0]);
			}
		}

		if (brandList.length === 5) {
			resultType = 'make';
		} else {
			resultType = 'model';
		}

		results.forEach((element, index) => {
			marketingNameAndMakeMap[element] = element.split(' ')[0];
		});

		dataObject.brandList = brandList;
		dataObject.results = results;
		dataObject.resultType = resultType;
		dataObject.marketingNameAndMakeMap = marketingNameAndMakeMap;
		res.status(200).json({
			reason: 'Search suggestions fetched successfully',
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
