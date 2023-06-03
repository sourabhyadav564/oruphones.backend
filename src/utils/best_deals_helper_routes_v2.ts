import redis from '../../config/redis';
import favoriteModal from '../../src/database/modals/favorite/favorite_add';
import bestDealsModal from '../../src/database/modals/others/best_deals_models';
import applySortFilter from './sort_filter';

const commonFunc = async (
	location: string,
	term: string | any[],
	page: string,
	userUniqueId: string,
	sortBy: any,
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: {
				(arg0: {
					reason: string;
					statusCode: number;
					status: string;
					dataObject: any;
				}): void;
				new (): any;
			};
		};
		statusCode: (arg0: number) => {
			(): any;
			new (): any;
			send: { (arg0: unknown): void; new (): any };
		};
	},
	type: string
) => {
	const cacheKey = `commonFunc:${location}:${term}:${page}:${sortBy}:${type}`;

	try {
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			const dataObject = JSON.parse(cachedData);
			return res.status(200).json({
				reason: 'Best deals found (from Redis cache)',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		}

		let updatedBestDeals = [];
		let otherListings: any[] = [];

		let favList: string | any[] = [];
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
		if (location !== 'India') {
			findingData = {
				...findingData,
				$or: [{ listingLocation: location }, { listingLocation: 'India' }],
			};
		}

		const fitlerResults = await applySortFilter(sortBy, page, findingData);

		if (userUniqueId !== 'Guest') {
			fitlerResults.completeDeals.forEach((item: any, index: number) => {
				if (item.listingId && favList.includes(item.listingId)) {
					item.favourite = true;
				} else {
					item.favourite = false;
				}
			});
		}

		let completeDeals: any[] = [];
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

		updatedBestDeals = completeDeals;
		if (parseInt(page) == 0) {
			otherListings = fitlerResults.completeDeals;
			updatedBestDeals.forEach((item: { listingId: any }, index: any) => {
				otherListings.splice(
					otherListings.findIndex((x) => x.listingId === item.listingId),
					1
				);
			});
		} else {
			otherListings = fitlerResults.completeDeals;
			updatedBestDeals = [];
		}

		const dataObject = {
			bestDeals: updatedBestDeals,
			otherListings: otherListings,
			totalProducts:
				fitlerResults.totalProducts -
				(fitlerResults.bestDealsCount > 5 ? 5 : fitlerResults.bestDealsCount),
		};

		await redis.setex(cacheKey, 24 * 60 * 60, JSON.stringify(dataObject));

		res.status(200).json({
			reason: 'Best deals found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (err) {
		console.log(err);
		res.statusCode(500).send(err);
	}
};

const bestDealsNearMe = async (
	location: any,
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any
) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearme');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsNearMe = bestDealsNearMe;

const topSelling = async (
	location: any,
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any,
	count: any
) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearme');
	} catch (error) {
		console.log(error);
	}
};

exports.topSelling = topSelling;

const bestDealsNearAll = async (
	location: any,
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any
) => {
	try {
		commonFunc(location, 'all', page, userUniqueId, sortBy, res, 'nearall');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsNearAll = bestDealsNearAll;

const bestDealsByMake = async (
	location: any,
	make: any,
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any
) => {
	try {
		commonFunc(location, make, page, userUniqueId, sortBy, res, 'make');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsByMake = bestDealsByMake;

const bestDealsByMarketingName = async (
	location: any,
	marketingName: any,
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any
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
	}
};

exports.bestDealsByMarketingName = bestDealsByMarketingName;

const bestDealsForSearchListing = async (
	location: string,
	page: number,
	userUniqueId: string,
	deals: any[],
	totalProducts: any,
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: {
				(arg0: {
					reason: string;
					statusCode: number;
					status: string;
					dataObject:
						| { bestDeals: any; otherListings: any; totalProducts: any }
						| { bestDeals: any; otherListings: any; totalProducts: any };
				}): void;
				new (): any;
			};
		};
	}
) => {
	try {
		let updatedBestDeals = [];
		let otherListings = [];

		let favList: string | any[] = [];
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
				deals.forEach((item: { listingId: any }, index: number) => {
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
				deals.forEach((item: { listingId: any }, index: number) => {
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
		}
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsForSearchListing = bestDealsForSearchListing;

const bestDealsForShopByCategory = async (
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any,
	location: any,
	category: any
) => {
	try {
		commonFunc(location, category, page, userUniqueId, sortBy, res, 'category');
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsForShopByCategory = bestDealsForShopByCategory;

const bestDealsForShopByPrice = async (
	page: any,
	userUniqueId: any,
	sortBy: any,
	res: any,
	location: any,
	startPrice: any,
	endPrice: any
) => {
	try {
		commonFunc(
			location,
			[startPrice, endPrice],
			page,
			userUniqueId,
			sortBy,
			res,
			'price'
		);
	} catch (error) {
		console.log(error);
	}
};

exports.bestDealsForShopByPrice = bestDealsForShopByPrice;
