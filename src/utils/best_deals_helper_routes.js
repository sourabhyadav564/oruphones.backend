// const getBestDeals = require("./get_best_deals");
const bestDealsModal = require('@/database/modals/others/best_deals_models');
const favoriteModal = require('@/database/modals/favorite/favorite_add');
// const saveListingModal = require("../src/database/modals/device/save_listing_device");
const applySortFilter = require('./sort_filter');
const { async } = require('@firebase/util');
const { neededKeysForDeals } = require('./matrix_figures');

const commonFunc = async (
	location,
	term,
	page,
	userUniqueId,
	sortBy,
	res,
	type
) => {
	let updatedBestDeals = [];
	let otherListings = [];

	let favList = [];
	if (userUniqueId !== 'Guest') {
		// const getFavObject = await favoriteModal.findOne({
		//   userUniqueId: userUniqueId,
		// });

		let getFavObject = await favoriteModal.aggregate([
			{
				$match: {
					userUniqueId: userUniqueId,
				},
			},
			{
				$project: {
					_id: 0,
					fav_listings: 1,
				},
			},
		]);

		if (getFavObject && getFavObject.length > 0 && getFavObject[0].length > 0) {
			favList = getFavObject[0].fav_listings;
		} else {
			favList = [];
		}
	}

	let findingData = {};
	if (type == 'category') {
		switch (term) {
			case 'verified':
				findingData = {
					verified: true,
					status: ['Active', 'Sold_Out'],
				};
				break;
			case 'warranty':
				findingData = {
					$expr: {
						$and: [
							{ $ne: ['$warranty', 'No'] },
							{ $ne: ['$warranty', 'None'] },
							{ $ne: ['$warranty', null] },
							// { $nin: ["$warranty", ["None", "No"]] },
							// { "$not": { "$in": ["$warranty", ["None", "No"]] }}
						],
					},
					status: ['Active', 'Sold_Out'],
				};
				break;
			case 'brandWarranty':
				findingData = {
					$expr: {
						$and: [
							{
								$or: [
									{ $eq: ['$warranty', 'More than 3 months'] },
									{ $eq: ['$warranty', 'More than 6 months'] },
									{ $eq: ['$warranty', 'More than 9 months'] },
								],
							},
							{ $ne: ['$warranty', 'None'] },
							{ status: ['Active', 'Sold_Out'] },
						],
					},
				};
				break;
			case 'sellerWarranty':
				findingData = {
					$expr: {
						$and: [
							{ $ne: ['$warranty', 'More than 3 months'] },
							{ $ne: ['$warranty', 'More than 6 months'] },
							{ $ne: ['$warranty', 'More than 9 months'] },
							{ $ne: ['$warranty', 'None'] },
							{ $ne: ['$warranty', 'No'] },
							{ $ne: ['$warranty', null] },
							{ status: ['Active', 'Sold_Out'] },
						],
					},
				};
				break;
			case 'like new':
				findingData = {
					deviceCondition: 'Like New',
					status: ['Active', 'Sold_Out'],
				};
				break;
		}
	} else if (type == 'price') {
		findingData = {
			$expr: {
				$and: [
					{
						$lte: [
							{
								$toInt: '$listingPrice',
							},
							parseInt(term[1].toString()),
						],
					},
					{
						$gte: [
							{
								$toInt: '$listingPrice',
							},
							parseInt(term[0].toString()),
						],
					},
				],
			},
			status: ['Active', 'Sold_Out'],
		};
	} else if (type == 'make') {
		findingData = {
			make: term,
			status: ['Active', 'Sold_Out'],
		};
	} else if (type == 'marketingName') {
		findingData = {
			marketingName: term,
			status: ['Active', 'Sold_Out'],
		};
	} else if (type == 'nearme' || type == 'nearall') {
		findingData = {
			status: ['Active', 'Sold_Out'],
		};
	} else if (type == 'filter') {
		findingData = term;
	}

	let newLocation = location;

	if (location?.toString()?.toLowerCase()?.includes(',')) {
		newLocation = location.split(',')[0].trim();
	}

	// update findingData with location if location is not India
	if (newLocation !== 'India') {
		findingData = {
			...findingData,
			$or: [{ listingLocation: newLocation }, { listingLocation: 'India' }],
		};
	}

	const fitlerResults = await applySortFilter(
		sortBy,
		// term,
		page,
		// location,
		findingData
	);

	if (userUniqueId !== 'Guest') {
		// add favorite listings to the final list
		fitlerResults.completeDeals.forEach((item, index) => {
			if (favList.includes(item.listingId)) {
				fitlerResults.completeDeals[index].favourite = true;
			} else {
				fitlerResults.completeDeals[index].favourite = false;
			}
		});
	}

	let completeDeals = [];
	// let isFromZero = sortBy === "NA" ? false : true;

	if (type != 'nearme') {
		completeDeals = await bestDealsModal
			.find(
				{
					...findingData,
					notionalPercentage: {
						$gt: 0,
						$lte: 40,
					},
				},
				neededKeysForDeals
			)
			.limit(5);
	}

	updatedBestDeals = completeDeals;
	if (page == 0) {
		otherListings = fitlerResults.completeDeals;
		updatedBestDeals.forEach((item, index) => {
			otherListings.splice(
				otherListings.findIndex((x) => x.listingId === item.listingId),
				1
			);
		});
	} else {
		otherListings = fitlerResults.completeDeals;
		updatedBestDeals = [];
	}

	res.status(200).json({
		reason: 'Best deals found',
		statusCode: 200,
		status: 'SUCCESS',
		dataObject: {
			bestDeals: updatedBestDeals,
			otherListings: otherListings,
			totalProducts:
				fitlerResults.totalProducts -
				(fitlerResults.bestDealsCount > 5 ? 5 : fitlerResults.bestDealsCount),
		},
	});
};

// -----------------------------------------------------------------------------------------------------------------------------

const bestDealsNearMe = async (location, page, userUniqueId, sortBy, res) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearme');
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsNearMe = bestDealsNearMe;

const bestDealsNearAll = async (location, page, userUniqueId, sortBy, res) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearall');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsNearAll = bestDealsNearAll;

const bestDealsByMake = async (
	location,
	make,
	page,
	userUniqueId,
	sortBy,
	res
) => {
	try {
		commonFunc(location, make, page, userUniqueId, sortBy, res, 'make');
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsByMake = bestDealsByMake;

const bestDealsByMarketingName = async (
	location,
	marketingName,
	page,
	userUniqueId,
	sortBy,
	res
) => {
	try {
		commonFunc(
			location,
			marketingName,
			page,
			userUniqueId,
			sortBy,
			res,
			'marketingName'
		);
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsByMarketingName = bestDealsByMarketingName;

const bestDealsForSearchListing = async (
	location,
	page,
	userUniqueId,
	// deals,
	// totalProducts,
	res,
	findData,
	sortBy
) => {
	try {
		commonFunc(location, findData, page, userUniqueId, sortBy, res, 'filter');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsForSearchListing = bestDealsForSearchListing;

const bestDealsForShopByCategory = async (
	page,
	userUniqueId,
	sortBy,
	res,
	location,
	category
) => {
	try {
		commonFunc(location, category, page, userUniqueId, sortBy, res, 'category');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsForShopByCategory = bestDealsForShopByCategory;

const bestDealsForShopByPrice = async (
	page,
	userUniqueId,
	// deals,
	// totalProducts,
	sortBy,
	res,
	location,
	startPrice,
	endPrice
) => {
	try {
		// todo: add location
		commonFunc(
			location,
			[startPrice, endPrice],
			page,
			userUniqueId,
			sortBy,
			res,
			'price'
		);
		// let updatedBestDeals = [];
		// let otherListings = [];

		// let favList = [];
		// if (userUniqueId !== "Guest") {
		//   const getFavObject = await favoriteModal.findOne({
		//     userUniqueId: userUniqueId,
		//   });

		//   if (getFavObject) {
		//     favList = getFavObject.fav_listings;
		//   } else {
		//     favList = [];
		//   }
		// }

		// if (userUniqueId !== "Guest") {
		//   deals.forEach((item, index) => {
		//     if (favList.includes(item.listingId)) {
		//       deals[index].favourite = true;
		//     } else {
		//       deals[index].favourite = false;
		//     }
		//   });
		// }

		// if (page == 0) {
		//   updatedBestDeals = deals.slice(0, 5);
		//   otherListings = deals.slice(5, deals.length);
		// } else {
		//   otherListings = deals;
		// }

		// let refineBestDeals = [];

		// updatedBestDeals.forEach((item, index) => {
		//   console.log("item", item.notionalPercentage);
		//   if (item.notionalPercentage > 0) {
		//     refineBestDeals.push(item);
		//   } else {
		//     otherListings.push(item);
		//   }
		// });

		// // if (sortBy === "NA") {
		// //   if (sortBy === "NA") {
		// //     otherListings.sort((a, b) => {
		// //       return (
		// //         b.notionalPercentage - a.notionalPercentage
		// //       );
		// //     });
		// //   }
		// // }

		// otherListings = await sortOtherListings(otherListings, sortBy);

		// res.status(200).json({
		//   reason: "Best deals found",
		//   statusCode: 200,
		//   status: "SUCCESS",
		//   dataObject: {
		//     bestDeals: refineBestDeals,
		//     otherListings: otherListings,
		//     totalProducts: totalProducts,
		//   },
		// });
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsForShopByPrice = bestDealsForShopByPrice;