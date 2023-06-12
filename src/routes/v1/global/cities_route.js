const express = require('express');
const router = express.Router();
require('@/database/connection');
const logEvent = require('@/middleware/event_logging');

const NodeCache = require('node-cache');
const shortLinkModal = require('@/database/modals/others/short_link_model');
const stateAreaModal = require('@/database/modals/global/locations/state');
const cityAreaModal = require('@/database/modals/global/locations/city');
const AreaModal = require('@/database/modals/global/locations/area');

router.get('/cities', async (req, res) => {
	try {
		let limited = req.query.limited || false;
		let searchText = req.query.searchText || '';
		let dataObject = [];
		dataObject.push({
			_id: '627ff0daad80a210af722de4675f8f8f',
			displayWithImage: '0',
			city: 'India',
		});
		let dataObject2 = [];
		if (!searchText || searchText == '') {
			dataObject2 = await cityAreaModal.aggregate([
				{
					$match: limited ? { displayWithImage: '1' } : {},
				},
				{
					$project: {
						city: '$name',
						displayWithImage: {
							$ifNull: ['$displayWithImage', '0'],
						},
						imgpath: '$imgpath' || null,
						id: '$id',
						parentId: '$parentId',
					},
				},
			]);
		} else {
			let dataObject3 = await cityAreaModal
				.aggregate([
					{
						$match: {
							name: {
								$all: searchText.split(' ').map((word) => {
									return new RegExp(word, 'i');
								}),
							},
						},
					},
					{
						$project: {
							city: '$name',
							displayWithImage: {
								$ifNull: ['$displayWithImage', '0'],
							},
							imgpath: '$imgpath' || null,
							id: '$id',
							parentId: '$parentId',
						},
					},
				])
				.limit(10);

			dataObject2 = dataObject3;
		}

		let allStates = await stateAreaModal.find({}, { name: 1, id: 1 });

		dataObject = dataObject.concat(dataObject2);

		let newDataObj = [];

		for (let i = 0; i < dataObject.length; i++) {
			let city = dataObject[i].city;

			let state = allStates.find((state) => {
				return state.id == dataObject[i].parentId;
			});

			if (state) {
				city += ', ' + state.name;
			}

			newDataObj.push({
				id: dataObject[i].id,
				city: city,
				displayWithImage: dataObject[i].displayWithImage,
				imgpath: dataObject[i].imgpath || null,
			});
		}

		res.status(200).json({
			reason: 'Cities found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject: newDataObj,
		});
	} catch (error) {
		res.status(400).json(error);
	}
});

router.get('/getLocationList', async (req, res) => {
	try {
		let type = req.query.type;
		let parentId = req.query.parentId;
		let latLong = req.query.latLong;

		let dataObject = [];

		let unwant = {
			_id: 0,
			type: 0,
		};

		if (type == 'state') {
			dataObject = await stateAreaModal.find({}, unwant);
		} else if (type == 'city') {
			dataObject = await cityAreaModal.find({ parentId }, unwant);
		} else if (type == 'area') {
			dataObject = await AreaModal.find({ parentId }, unwant);
		} else if (type == 'latLong') {
			latLong = latLong.toString();
			let lat = latLong.split(',')[0];
			let long = latLong.split(',')[1];

			lat = parseFloat(lat);
			long = parseFloat(long);

			let areaData = await AreaModal.aggregate([
				{
					$project: {
						id: 1,
						name: 1,
						longitude: 1,
						latitude: 1,
						parentId: 1,
						distance: {
							$sqrt: {
								$add: [
									{
										$pow: [
											{
												$subtract: ['$latitude', lat],
											},
											2,
										],
									},
									{
										$pow: [
											{
												$subtract: ['$longitude', long],
											},
											2,
										],
									},
								],
							},
						},
					},
				},
				{
					$sort: {
						distance: 1,
					},
				},
				{
					$limit: 1,
				},
			]);

			if (areaData.length > 0) {
				let area = areaData[0];
				let cityData = await cityAreaModal.findOne(
					{ id: area.parentId },
					unwant
				);
				let stateData = await stateAreaModal.findOne(
					{ id: cityData.parentId },
					unwant
				);
				dataObject.push({
					id: stateData.id,
					name: stateData.name,
					type: 'state',
				});
				dataObject.push({
					id: cityData.id,
					name: cityData.name,
					type: 'city',
				});
				dataObject.push({
					id: area.id,
					name: area.name,
					type: 'area',
				});
			}
		}

		res.status(200).json({
			reason: dataObject.length > 0 ? 'Locations found' : 'Locations not found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		res.status(400).json(error);
	}
});

router.get('/getLink', logEvent, async (req, res) => {
	try {
		const keyId = req.query.keyId;
		const getData = await shortLinkModal.findOne({ unKey: keyId });
		if (getData) {
			res.status(200).json({
				reason: 'Link found successfully',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject: {
					link: getData.linkStr,
				},
			});
		} else {
			res.status(404).json({
				reason: 'Link not found',
				statusCode: 404,
				status: 'FAILURE',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;