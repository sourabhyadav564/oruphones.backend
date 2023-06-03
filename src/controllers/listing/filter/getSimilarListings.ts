import { RETURN_FILTER } from './_constants';
import validator from './_validator';
import Listings from '@/database/modals/others/best_deals_models';
import { Request, Response, NextFunction } from 'express';

async function getSimilarListings(
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
			returnFilter = RETURN_FILTER;
		}
		// get similar products where id !=== listing id
		const pipeline = [
			{
				$match: {
					// _id: { $ne: filter.listingId },
					...(!filter.includeSelf && { _id: { $ne: filter.listingId } }),
					...(filter.make && { make: listing.make }),
					...(filter.model && { model: listing.model }),
				},
			},
			// add count filed, then limit
			{
				$project: {
					...returnFilter,
				},
			},
			{
				$facet: {
					data: [{ $limit: filter.limit }],
					totalCount: [{ $count: 'total' }],
				},
			},
			{ $unwind: '$totalCount' },
			{ $project: { data: 1, totalCount: '$totalCount.total' } },
		];
		const result = await Listings.aggregate(pipeline);
		res.json({ data: result[0] });
	} catch (err) {
		next(err);
	}
}

export default getSimilarListings;
