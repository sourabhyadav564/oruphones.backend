import { Request, Response } from 'express';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';

async function topSellingHome(req: Request, res: Response) {
	const { location, count } = req.body;
	// if location is India
	if (location === 'India') {
		// check cache for India
		let redisResponse = await redisClient.get('India');
		if (redisResponse !== null) {
			res.status(200).json({ data: JSON.parse(redisResponse) });
			return;
		}
		// if cache miss
		let topSelling = await Listing.find({}).sort({ sold: -1 }).limit(count);
		res.status(200).json({ data: topSelling });
		// set cache for India
		redisClient.set('India', JSON.stringify(topSelling));
		return;
	}
	let redisResponse = await redisClient.get(location);
	if (redisResponse !== null) {
		res.status(200).json({ data: JSON.parse(redisResponse) });
		return;
	}
	// if cache miss
	let topSelling = await Listing.find({ listingLocation: location })
		.sort({ sold: -1 })
		.limit(count);
	res.status(200).json({ data: topSelling });
	// set cache for India
	await redisClient.set(location, JSON.stringify(topSelling));
}

export default {
	topSellingHome,
};
