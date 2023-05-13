import { Request, Response } from 'express';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';

async function topSellingHome(req: Request, res: Response) {
	const { location, count } = req.body;
	//check redis for location
	let redisResponse = await redisClient.get(location);
	if (redisResponse !== null) {
		res.status(200).json({ data: JSON.parse(redisResponse) });
		return;
	}
	const filter = {
		...(location === 'India' ? {} : { listingLocation: location }),
	};
	const topSelling = await Listing.find(filter, {
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
	})
		.sort({ sold: -1 })
		.limit(count);
	res.status(200).json({ data: topSelling });
	await redisClient.setEx(location, 60 * 60 * 12, JSON.stringify(topSelling));
}

export default {
	topSellingHome,
};
