import filterController from '@/controllers/listing/filter';
import makes from '@/controllers/listing/makes';
import models from '@/controllers/listing/models';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	location: z.string().min(1).max(100),
	count: z.number().min(1).max(100),
});

async function topSellingHome(req: Request, res: Response, next: NextFunction) {
	try {
		let { location, count } = validator.parse(req.body);
		const key = `listing/topSellingHome/${location}}`;
		//check redis for location
		let redisResponse = await redisClient.get(key);
		if (redisResponse !== null) {
			console.log('This response was powered by redis');
			res.status(200).json({ data: JSON.parse(redisResponse) });
			return;
		}
		if (location && location !== 'India' && location.includes(',')) {
			location = location.split(',')[0];
		}
		const filter = {
			...(location === 'India'
				? {}
				: { listingLocation: { $in: [location, 'India'] } }),
		};
		const returnFilter = {
			_id: 1,
			deviceCondition: 1,
			deviceStorage: 1,
			listingLocation: 1,
			listingDate: 1,
			listingPrice: 1,
			name: 1,
			isOtherVendor: 1,
			marketingName: 1,
			listingId: 1,
			verified: 1,
			imagePath: 1,
			status: 1,
		};
		let topSelling = await Listing.find(filter, returnFilter)
			.limit(count)
			.lean();
		// check if top selling is empty
		if (topSelling.length < count) {
			topSelling = await Listing.find({}, returnFilter).limit(count).lean();
		}
		res.status(200).json({ data: topSelling });
		await redisClient.setEx(key, 60 * 60 * 12, JSON.stringify(topSelling));
	} catch (error) {
		next(error);
	}
}

export default {
	topSellingHome,
	filter: filterController,
	models,
	makes,
};
