const getBestDeals = require('./get_best_deals');
const bestDealsModal = require('@/database/modals/others/best_deals_models');
const favoriteModal = require('@/database/modals/favorite/favorite_add');
const saveListingModal = require('@/database/modals/device/save_listing_device');
const applySortFilter = require('./sort_filter');
const { async } = require('@firebase/util');

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
		const getFavObject = await favoriteModal.findOne({
			userUniqueId: userUniqueId,
		});

		if (getFavObject) {
			favList = getFavObject.fav_listings;
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
					warranty: [
						'More than 9 months',
						'More than 6 months',
						'More than 3 months',
					],
					status: ['Active', 'Sold_Out'],
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
			listingPrice: {
				$gte: term[0],
				$lte: term[1],
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
	}

	// update findingData with location if location is not India
	if (location !== 'India') {
		findingData = {
			...findingData,
			$or: [{ listingLocation: location }, { listingLocation: 'India' }],
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
			.find({
				...findingData,
				notionalPercentage: {
					$gt: 0,
					$lte: 40,
				},
			})
			.limit(5);
	}

	// if (location !== "India") {
	//   switch (type) {
	//     case "make":
	//       completeDeals = await bestDealsModal
	//         .find({
	//           status: ["Active", "Sold_Out"],
	//           make: term,
	//           $or: [{ listingLocation: location }, { listingLocation: "India" }],
	//         })
	//         .limit(5);
	//       break;
	//     case "marketingName":
	//       completeDeals = await bestDealsModal
	//         .find({
	//           status: ["Active", "Sold_Out"],
	//           marketingName: term,
	//           $or: [{ listingLocation: location }, { listingLocation: "India" }],
	//         })
	//         .limit(5);
	//       break;
	//     case "nearme":
	//       completeDeals = [];

	//       // completeDeals = await bestDealsModal
	//       //   .find({
	//       //     status: ["Active", "Sold_Out"],
	//       //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
	//       //   })
	//       //   .limit(5);
	//       break;
	//     case "nearall":
	//       completeDeals = await bestDealsModal
	//         .find({
	//           status: ["Active", "Sold_Out"],
	//           $or: [{ listingLocation: location }, { listingLocation: "India" }],
	//         })
	//         .limit(5);
	//       break;
	//     case "category":
	//       completeDeals = await bestDealsModal.find(findingData).limit(5);
	//       break;
	//   }
	// } else {
	//   switch (type) {
	//     case "make":
	//       completeDeals = await bestDealsModal
	//         .find({ status: ["Active", "Sold_Out"], make: term })
	//         .limit(5);
	//       break;
	//     case "marketingName":
	//       completeDeals = await bestDealsModal
	//         .find({ status: ["Active", "Sold_Out"], marketingName: term })
	//         .limit(5);
	//       break;
	//     case "nearme":
	//       completeDeals = [];
	//       // completeDeals = await bestDealsModal
	//       //   .find({ status: ["Active", "Sold_Out"] })
	//       //   .limit(5);
	//       break;
	//     case "nearall":
	//       completeDeals = await bestDealsModal
	//         .find({ status: ["Active", "Sold_Out"] })
	//         .limit(5);
	//       break;
	//     case "category":
	//       completeDeals = await bestDealsModal.find(findingData).limit(5);
	//       break;
	//   }
	// }

	updatedBestDeals = completeDeals;
	if (page == 0) {
		otherListings = fitlerResults.completeDeals;
		// .slice(
		//   isFromZero ? 0 : 5,
		//   fitlerResults.completeDeals.length
		// );
		updatedBestDeals.forEach((item, index) => {
			otherListings.splice(
				otherListings.findIndex((x) => x.listingId === item.listingId),
				1
			);
		});
	} else {
		otherListings = fitlerResults.completeDeals;
		// updatedBestDeals.forEach((item, index) => {
		//   otherListings.splice(
		//     otherListings.findIndex((x) => x.listingId === item.listingId),
		//     1
		//   );
		// });
		updatedBestDeals = [];
	}

	// let refineBestDeals = [];

	// updatedBestDeals.forEach((item, index) => {
	//   console.log("item", item.notionalPercentage);
	//   if (item.notionalPercentage > 0) {
	//     refineBestDeals.push(item);
	//   } else {
	//     otherListings.push(item);
	//   }
	// });

	// if (sortBy === "NA") {
	//   otherListings.sort((a, b) => {
	//     return (
	//       b.notionalPercentage - a.notionalPercentage
	//     );
	//   });
	// }

	// otherListings = await sortOtherListings(otherListings, sortBy);

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
	// } else {
	// const fitlerResults = await applySortFilter(sortBy, make, page, location);

	// let isFromZero = sortBy === "NA" ? false : true;
	// completeDeals = await bestDealsModal
	//   .find({
	//     status: ["Active", "Sold_Out"],
	//     make: make,
	//     $or: [{ listingLocation: location }, { listingLocation: "India" }],
	//   })
	//   .limit(5);

	// updatedBestDeals = completeDeals;
	// if (page == 0) {
	//   otherListings = fitlerResults.completeDeals;
	//   // .slice(
	//   //   isFromZero ? 0 : 5,
	//   //   fitlerResults.completeDeals.length
	//   // );
	//   updatedBestDeals.forEach((item, index) => {
	//     otherListings.splice(
	//       otherListings.findIndex((x) => x.listingId === item.listingId),
	//       1
	//     );
	//   });
	// } else {
	//   otherListings = fitlerResults.completeDeals;
	//   updatedBestDeals.forEach((item, index) => {
	//     otherListings.splice(
	//       otherListings.findIndex((x) => x.listingId === item.listingId),
	//       1
	//     );
	//   });
	//   updatedBestDeals = [];
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
	// //   otherListings.sort((a, b) => {
	// //     return (
	// //       b.notionalPercentage - a.notionalPercentage
	// //     );
	// //   });
	// // }

	// switch (sortBy) {
	//   case "NA":
	//     otherListings.sort((a, b) => {
	//       return (
	//         b.notionalPercentage - a.notionalPercentage
	//       );
	//     });
	//     break;
	//   case "Price - High to Low":
	//     otherListings.sort({ listingPrice: -1 });
	//     break;
	//   case "Price - Low to High":
	//     otherListings.sort({ listingPrice: 1 });
	//     break;
	//   case "Newest First":
	//     otherListings.sort({ createdAt: -1 });
	//     break;
	//   case "Oldest First":
	//     otherListings.sort({ createdAt: 1 });
	//     break;
	//   default:
	//     otherListings.sort((a, b) => {
	//       return (
	//         b.notionalPercentage - a.notionalPercentage
	//       );
	//     });
	//     break;
	// };

	// res.status(200).json({
	//   reason: "Best deals found",
	//   statusCode: 200,
	//   status: "SUCCESS",
	//   dataObject: {
	//     bestDeals: refineBestDeals,
	//     otherListings: otherListings,
	//     totalProducts: fitlerResults.totalProducts -
	//       (fitlerResults.bestDealsCount > 5
	//         ? 5
	//         : fitlerResults.bestDealsCount),
	//   },
	// });
	// }
};

const sortOtherListings = async (otherListings, sortBy) => {
	switch (sortBy) {
		case 'NA':
			otherListings.sort((a, b) => {
				return b.notionalPercentage - a.notionalPercentage;
			});
			break;
		case 'Price - High to Low':
			otherListings.sort((a, b) => {
				return b.listingPrice - a.listingPrice;
			});
			// otherListings.sort({ listingPrice: -1 });
			break;
		case 'Price - Low to High':
			otherListings.sort((a, b) => {
				return a.listingPrice - b.listingPrice;
			});
			// otherListings.sort({ listingPrice: 1 });
			break;
		case 'Newest First':
			otherListings.sort((a, b) => {
				return b.createdAt - a.createdAt;
			});
			// otherListings.sort({ createdAt: -1 });
			break;
		case 'Oldest First':
			otherListings.sort((a, b) => {
				return a.createdAt - b.createdAt;
			});
			// otherListings.sort({ createdAt: 1 });
			break;
		default:
			otherListings.sort((a, b) => {
				return b.notionalPercentage - a.notionalPercentage;
			});
			break;
	}

	return otherListings;
};

const bestDealsNearMe = async (location, page, userUniqueId, sortBy, res) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearme');
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

		// if (location === "India") {
		//   const fitlerResults = await applySortFilter(
		//     sortBy,
		//     "all",
		//     page,
		//     location
		//   );

		//   if (userUniqueId !== "Guest") {
		//     // add favorite listings to the final list
		//     fitlerResults.completeDeals.forEach((item, index) => {
		//       if (favList.includes(item.listingId)) {
		//         fitlerResults.completeDeals[index].favourite = true;
		//       } else {
		//         fitlerResults.completeDeals[index].favourite = false;
		//       }
		//     });
		//   }

		//   let isFromZero = sortBy === "NA" ? false : true;
		//   completeDeals = await bestDealsModal
		//     .find({ status: ["Active", "Sold_Out"] })
		//     .limit(5);
		//   updatedBestDeals = completeDeals;

		//   if (page == 0) {
		//     otherListings = fitlerResults.completeDeals;
		//     // .slice(
		//     //   isFromZero ? 0 : 5,
		//     //   fitlerResults.completeDeals.length
		//     // );
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//   } else {
		//     otherListings = fitlerResults.completeDeals;
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//     updatedBestDeals = [];
		//   }

		//   let refineBestDeals = [];
		//   let refineOtherDeals = [];

		//   updatedBestDeals.forEach((item, index) => {
		//     console.log("item", item.notionalPercentage);
		//     if (item.notionalPercentage > 0) {
		//       refineBestDeals.push(item);
		//     } else {
		//       refineOtherDeals.push(item);
		//     }
		//   });

		//   refineOtherDeals.push(...otherListings);

		//   if (sortBy === "NA") {
		//     refineOtherDeals.sort((a, b) => {
		//       return (
		//         b.notionalPercentage - a.notionalPercentage
		//       );
		//     });
		//   }

		//   res.status(200).json({
		//     reason: "Best deals found",
		//     statusCode: 200,
		//     status: "SUCCESS",
		//     dataObject: {
		//       bestDeals: refineBestDeals,
		//       otherListings: refineOtherDeals,
		//       totalProducts: fitlerResults.totalProducts -
		//         (fitlerResults.bestDealsCount > 5
		//           ? 5
		//           : fitlerResults.bestDealsCount),
		//     },
		//   });
		// } else {
		//   const fitlerResults = await applySortFilter(
		//     sortBy,
		//     "all",
		//     page,
		//     location
		//   );

		//   let isFromZero = sortBy === "NA" ? false : true;
		//   completeDeals = await bestDealsModal
		//     .find({
		//       status: ["Active", "Sold_Out"],
		//       $or: [{ listingLocation: location }, { listingLocation: "India" }],
		//     })
		//     .limit(5);

		//   updatedBestDeals = completeDeals;

		//   if (page == 0) {
		//     // updatedBestDeals = fitlerResults.completeDeals.slice(0, 5);
		//     otherListings = fitlerResults.completeDeals;
		//     // .slice(
		//     //   isFromZero ? 0 : 5,
		//     //   fitlerResults.completeDeals.length
		//     // );
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//   } else {
		//     otherListings = fitlerResults.completeDeals;
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//     updatedBestDeals = [];
		//   }
		//   let refineBestDeals = [];

		//   updatedBestDeals.forEach((item, index) => {
		//     console.log("item", item.notionalPercentage);
		//     if (item.notionalPercentage > 0) {
		//       refineBestDeals.push(item);
		//     } else {
		//       otherListings.push(item);
		//     }
		//   });

		//   if (sortBy === "NA") {
		//     otherListings.sort((a, b) => {
		//       return (
		//         b.notionalPercentage - a.notionalPercentage
		//       );
		//     });
		//   }

		//   res.status(200).json({
		//     reason: "Best deals found",
		//     statusCode: 200,
		//     status: "SUCCESS",
		//     dataObject: {
		//       bestDeals: refineBestDeals,
		//       otherListings: otherListings,
		//       totalProducts: fitlerResults.totalProducts -
		//         (fitlerResults.bestDealsCount > 5
		//           ? 5
		//           : fitlerResults.bestDealsCount),
		//     },
		//   });
		// }
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsNearMe = bestDealsNearMe;

const bestDealsNearAll = async (location, page, userUniqueId, sortBy, res) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearall');
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

		// if (location === "India") {
		//   const fitlerResults = await applySortFilter(
		//     sortBy,
		//     "all",
		//     page,
		//     location
		//   );

		//   if (userUniqueId !== "Guest") {
		//     // add favorite listings to the final list
		//     fitlerResults.completeDeals.forEach((item, index) => {
		//       if (favList.includes(item.listingId)) {
		//         fitlerResults.completeDeals[index].favourite = true;
		//       } else {
		//         fitlerResults.completeDeals[index].favourite = false;
		//       }
		//     });
		//   }

		//   let isFromZero = sortBy === "NA" ? false : true;
		//   completeDeals = await bestDealsModal
		//     .find({ status: ["Active", "Sold_Out"] })
		//     .limit(5);

		//   updatedBestDeals = completeDeals;

		//   if (page == 0) {
		//     otherListings = fitlerResults.completeDeals;
		//     // .slice(
		//     //   isFromZero ? 0 : 5,
		//     //   fitlerResults.completeDeals.length
		//     // );
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//   } else {
		//     otherListings = fitlerResults.completeDeals;
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//     updatedBestDeals = [];
		//   }

		//   let refineBestDeals = [];

		//   updatedBestDeals.forEach((item, index) => {
		//     console.log("item", item.notionalPercentage);
		//     if (item.notionalPercentage > 0) {
		//       refineBestDeals.push(item);
		//     } else {
		//       otherListings.push(item);
		//     }
		//   });

		//   if (sortBy === "NA") {
		//     otherListings.sort((a, b) => {
		//       return (
		//         b.notionalPercentage - a.notionalPercentage
		//       );
		//     });
		//   }

		//   res.status(200).json({
		//     reason: "Best deals found",
		//     statusCode: 200,
		//     status: "SUCCESS",
		//     dataObject: {
		//       bestDeals: refineBestDeals,
		//       otherListings: otherListings,
		//       totalProducts: fitlerResults.totalProducts -
		//         (fitlerResults.bestDealsCount > 5
		//           ? 5
		//           : fitlerResults.bestDealsCount),
		//     },
		//   });
		// } else {
		//   const fitlerResults = await applySortFilter(
		//     sortBy,
		//     "all",
		//     page,
		//     location
		//   );

		//   let isFromZero = sortBy === "NA" ? false : true;
		//   completeDeals = await bestDealsModal
		//     .find({
		//       status: ["Active", "Sold_Out"],
		//       $or: [{ listingLocation: location }, { listingLocation: "India" }],
		//     })
		//     .limit(5);

		//   updatedBestDeals = completeDeals;

		//   if (page == 0) {
		//     otherListings = fitlerResults.completeDeals;
		//     // .slice(
		//     //   isFromZero ? 0 : 5,
		//     //   fitlerResults.completeDeals.length
		//     // );
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//   } else {
		//     otherListings = fitlerResults.completeDeals;
		//     updatedBestDeals.forEach((item, index) => {
		//       otherListings.splice(
		//         otherListings.findIndex((x) => x.listingId === item.listingId),
		//         1
		//       );
		//     });
		//     updatedBestDeals = [];
		//   }

		//   let refineBestDeals = [];

		//   updatedBestDeals.forEach((item, index) => {
		//     console.log("item", item.notionalPercentage);
		//     if (item.notionalPercentage > 0) {
		//       refineBestDeals.push(item);
		//     } else {
		//       otherListings.push(item);
		//     }
		//   });

		//   if (sortBy === "NA") {
		//     otherListings.sort((a, b) => {
		//       return (
		//         b.notionalPercentage - a.notionalPercentage
		//       );
		//     });
		//   }

		//   res.status(200).json({
		//     reason: "Best deals found",
		//     statusCode: 200,
		//     status: "SUCCESS",
		//     dataObject: {
		//       bestDeals: refineBestDeals,
		//       otherListings: otherListings,
		//       totalProducts: fitlerResults.totalProducts -
		//         (fitlerResults.bestDealsCount > 5
		//           ? 5
		//           : fitlerResults.bestDealsCount),
		//     },
		//   });
		// }
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
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
	deals,
	totalProducts,
	res
) => {
	try {
		let updatedBestDeals = [];
		let otherListings = [];

		let favList = [];
		if (userUniqueId !== 'Guest') {
			const getFavObject = await favoriteModal.findOne({
				userUniqueId: userUniqueId,
			});

			if (getFavObject) {
				favList = getFavObject.fav_listings;
			} else {
				favList = [];
			}
		}

		if (location === 'India') {
			if (userUniqueId !== 'Guest') {
				deals.forEach((item, index) => {
					if (favList.includes(item.listingId)) {
						deals[index].favourite = true;
					} else {
						deals[index].favourite = false;
					}
				});
			}

			if (page == 0) {
				updatedBestDeals = deals.slice(0, 5);
				otherListings = deals.slice(5, deals.length);
			} else {
				otherListings = deals;
			}
			res.status(200).json({
				reason: 'Best deals found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject: {
					bestDeals: updatedBestDeals,
					otherListings: otherListings,
					totalProducts: totalProducts,
				},
			});
		} else {
			if (userUniqueId !== 'Guest') {
				deals.forEach((item, index) => {
					if (favList.includes(item.listingId)) {
						deals[index].favourite = true;
					} else {
						deals[index].favourite = false;
					}
				});
			}

			// let getSavedDeals = await saveListingModal.find({
			//   status: ["Active", "Sold_Out"],
			//   $or: [{ listingLocation: location }, { listingLocation: "India" }],
			// });

			// deals = deals.concat(getSavedDeals);

			if (page == 0) {
				updatedBestDeals = deals.slice(0, 5);
				otherListings = deals.slice(5, deals.length);
			} else {
				otherListings = deals;
			}
			res.status(200).json({
				reason: 'Best deals found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject: {
					bestDeals: updatedBestDeals,
					otherListings: otherListings,
					totalProducts: totalProducts,
				},
			});
		}
	} catch (error) {
		console.log(error);
		// res.status(400).json(error);
	}
};

exports.bestDealsForSearchListing = bestDealsForSearchListing;

const bestDealsForShopByCategory = async (
	page,
	userUniqueId,
	// deals,
	// totalProducts,
	sortBy,
	res,
	location,
	category
) => {
	try {
		commonFunc(location, category, page, userUniqueId, sortBy, res, 'category');
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

		// // otherListings.sort((a, b) => {
		// //   return (
		// //     b.notionalPercentage - a.notionalPercentage
		// //   );
		// // });
		// console.log("sortBy", sortBy);
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
