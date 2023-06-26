import listings from './listings';
import sendVerification from './sendVerification';
import filterController from '@/controllers/listing/filter';
import makes from '@/controllers/listing/makes';
import models from '@/controllers/listing/models';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	count: z.number().min(1).max(100),
});

async function topSellingHome(req: Request, res: Response, next: NextFunction) {
	try {
		console.log(req.body);
		let { longitude, latitude, count } = validator.parse(req.body);

		const key = `listing/topsellingHome/${longitude}/${latitude}}`;
		//check redis for location
		let redisResponse = await redisClient.get(key);
		if (redisResponse !== null) {
			console.log('This response was powered by redis');
			res.status(200).json({ data: JSON.parse(redisResponse) });
			return;
		}

		const returnFilter = {
			_id: 1,
			deviceCondition: 1,
			deviceStorage: 1,
			listingLocation: 1,
			listingLocality: 1,
			listingState: 1,
			listingDate: 1,
			listingPrice: 1,
			name: 1,
			isOtherVendor: 1,
			marketingName: 1,
			locationId: 1,
			verified: 1,
			imagePath: 1,
			status: 1,
			listingId: 1,
		};

		let topSelling = await Listing.find(
			{
				location: {
					$near: {
						$geometry: { type: 'Point', coordinates: [longitude, latitude] },
						$maxDistance: 500000,
					},
				},
			},
			returnFilter
		)
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
		console.log(error);
	}
}

export default {
	topSellingHome,
	filter: filterController,
	models,
	makes,
	listings,
	sendVerification,
};
