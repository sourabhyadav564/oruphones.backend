import { RETURN_FILTER } from './_constants';
import validator from './_validator';
import getSimilarListings from './getSimilarListings';
import getSimilarPriceRange from './getSimilarPriceRange';
import getSimilarWithExternalVendors from './getSimilarWithExternalVendors';
import Listings from '@/database/modals/others/best_deals_models';
import rankedListings from '@/database/modals/others/test_scrapped_models';
import { NextFunction, Request, Response } from 'express';

// function that constructs the pipeline for aggregation
function constructPipeline(
	filterObj: any,
	returnFilter: any,
	sortObj: any,
	priceRangeObj: any,
	page: number,
	limit: number,
	notionalBestDealListingIds: string[] | undefined = undefined
) {
	const pipeline = [
		{
			$match: {
				...filterObj,
				...(notionalBestDealListingIds && {
					listingId: { $nin: notionalBestDealListingIds },
				}),
			},
		},
		...(sortObj && Object.keys(sortObj).length > 0 ? [{ $sort: sortObj }] : []),
		...(priceRangeObj && Object.keys(priceRangeObj?.listingNumPrice).length > 0
			? [{ $match: priceRangeObj }]
			: []),
		{ $project: returnFilter },
		{
			$facet: {
				totalCount: [{ $count: 'total' }],
				data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
			},
		},
		{ $unwind: '$totalCount' },
		{ $project: { data: 1, totalCount: '$totalCount.total' } },
	];
	return pipeline;
}

async function filter(req: Request, res: Response, next: NextFunction) {
	try {
		let { filter, returnFilter } = validator.parse(req.body);
		let { notionalFilter } = req.query;
		// construct return shape filter if not provided
		//optional return filter lets us choose what we want to return
		if (!returnFilter) {
			returnFilter = RETURN_FILTER;
		}
		let { sort } = filter;
		// if ID is provided, just return by ID
		if (filter.listingId) {
			let result = await Listings.findOne({
				listingId: filter.listingId,
			})
				.select(returnFilter)
				.lean();
			// if isOtherVendor is Y, find vendorLink
			let vendorLink: string;
			if (result?.isOtherVendor === 'Y') {
				vendorLink = await rankedListings
					.findOne({
						listingId: filter.listingId,
					})
					.select({ link: 1 })
					.lean()
					.then((res: any) => res?.link);
			} else {
				vendorLink = `/product/buy-old-refurbished-used-mobiles/${result?.make}/${result?.model}/${result?.listingId}`;
			}
			res.json({
				data: {
					...result,
					vendorLink,
				},
			});
			return;
		}
		// return an array of listings and a count, paginated.
		const {
			make,
			model,
			condition,
			storage,
			warranty,
			verified,
			ram,
			priceRange,
			listingLocation,
		} = filter;
		let filterObj = {
			...(make && { make: { $in: make } }),
			...(model && { model: { $in: model } }),
			...(condition && { deviceCondition: { $in: condition } }),
			...(storage && { deviceStorage: { $in: storage } }),
			...(ram && { deviceRam: { $in: ram } }),
			...(listingLocation === 'India'
				? {}
				: {
						$or: [
							{
								listingLocation: 'India',
							},
							{
								listingLocation: listingLocation?.split(',')[0],
								listingState: listingLocation?.split(',')[1],
							},
						],
				  }),
			...(warranty && {
				warranty:
					warranty.length > 1
						? {
								$exists: true,
								$nin: ['No', 'None'],
						  }
						: {
								$exists: true,
								$nin: [
									'No',
									'None',
									...(warranty.includes('Seller Warranty')
										? [
												'More than 3 months',
												'More than 6 months',
												'More than 9 months',
												null,
										  ]
										: []),
								],
								...(warranty.includes('Brand Warranty')
									? {
											$in: [
												'More than 3 months',
												'More than 6 months',
												'More than 9 months',
											],
									  }
									: {}),
						  },
			}),
			...(verified && { verified }),
		};
		// if notionalFilter is provided, return an extra field with bestDeals
		let bestDealsForCarousal = undefined;
		if (notionalFilter) {
			bestDealsForCarousal = await Listings.find({
				...filterObj,
				notionalPercentage: {
					$exists: true,
					$type: 'number',
					$gt: 0,
					$lt: 40,
				},
			})
				.limit(5)
				.select(returnFilter)
				.lean();
		}
		const notionalBestDealListingIds = bestDealsForCarousal?.map(
			(listing) => listing.listingId as string
		);
		//calculate pagination
		const page = req.body.filter.page || 1;
		const limit = req.body.filter.limit || 20;

		//sort object
		const sortObj = sort && {
			...(sort.price && { listingNumPrice: sort.price }),
			...(sort.date && { createdAt: sort.date }),
		};

		// priceRange object
		const priceRangeObj = priceRange && {
			listingNumPrice: {
				...(priceRange[0] && priceRange[0] !== null && { $gte: priceRange[0] }),
				...(priceRange[1] && priceRange[1] !== null && { $lte: priceRange[1] }),
			},
		};
		// pipeline into two faucets to calculate total count and data
		// This prevents 2 DB calls
		let pipeline = constructPipeline(
			filterObj,
			returnFilter,
			sortObj,
			priceRangeObj,
			page,
			limit,
			notionalBestDealListingIds
		);
		// Execute the aggregation pipeline
		let result = await Listings.aggregate(pipeline);
		const data = {
			...result[0], // result[0] has the data and totalCount
			...(page === 1 && bestDealsForCarousal && bestDealsForCarousal.length > 0
				? { bestDeals: bestDealsForCarousal }
				: {}),
		};
		res.status(200).json({
			...(Object.keys(data).length > 0 ? { data } : {}),
		});
	} catch (err) {
		next(err);
	}
}

export default {
	filter,
	getSimilarListings,
	getSimilarWithExternalVendors,
	getSimilarPriceRange,
};
