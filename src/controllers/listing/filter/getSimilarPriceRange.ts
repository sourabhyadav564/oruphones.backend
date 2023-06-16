import { RETURN_FILTER } from './_constants';
import validator from './_validator';
import Listings from '@/database/modals/others/best_deals_models';
import { Request, Response, NextFunction } from 'express';

async function getSimilarPriceRange(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		let { filter, returnFilter } = validator.parse(req.body);
		const listing = await Listings.findOne({
			listingId: filter.listingId,
		});
		if (!listing) throw new Error('Listing not found');
		if (!filter.limit) filter.limit = 20;
		if (!returnFilter) {
			returnFilter = { ...RETURN_FILTER, warranty: 1 };
		}
		// if listing's make is apple, then add apple to filter
		if (listing.make === 'Apple') {
			filter.make = ['Apple'];
		}
		// filter such that price is within 20% of listing price
		const priceRangeObj = listing.listingNumPrice && {
			listingNumPrice: {
				$gt: listing.listingNumPrice * 0.8,
				$lt: listing.listingNumPrice * 1.2,
			},
		};
		// construct filterObj
		const filterObj = {
			...(filter.includeSelf ? {} : { listingId: { $ne: filter.listingId } }),
			...(filter.make && { make: { $in: filter.make } }),
		};
		//  construct pipeline
		const pipeline = [
			...(Object.keys(filterObj).length > 0 ? [{ $match: filterObj }] : []),
			...(priceRangeObj && Object.keys(priceRangeObj).length > 0
				? [{ $match: priceRangeObj }]
				: []),
			{ $project: returnFilter },
			{
				$facet: {
					totalCount: [{ $count: 'total' }],
					data: [{ $limit: filter.limit }],
				},
			},
			{ $unwind: '$totalCount' },
			{ $project: { data: 1, totalCount: '$totalCount.total' } },
		];

		const result = await Listings.aggregate(pipeline);

		res.status(200).json({
			data: result[0],
		});
	} catch (err) {
		next(err);
	}
}

export default getSimilarPriceRange;
