import Listings from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
	try {
		// check if redis has the data
		let redisResponse = await redisClient.get('allMakesUnique');
		//get all unique list for makes
		if (redisResponse !== null) {
			console.log('This response was powered by redis');
			res.status(200).json(JSON.parse(redisResponse));
			return;
		}
		// get string array of all makes without empty strings and order by frequency
		let makes = await Listings.aggregate([
			{ $match: { make: { $ne: '' } } },
			{ $group: { _id: '$make', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 25 },
			{ $project: { _id: true, count: false } },
		]);
		makes = makes.map((make) => make._id.toString());
		// Remove duplicates without case sensitivity
		let duplicateDictionary = new Map<string, number>();
		for (let i = 0; i < makes.length; i++) {
			const make = makes[i];
			const lowerCaseMake = make.toString().toLowerCase();
			if (duplicateDictionary.has(lowerCaseMake)) {
				makes.splice(i, 1);
				i--;
			}
			duplicateDictionary.set(lowerCaseMake, 1);
		}
		// const makes = await Listings.distinct('make', { make: { $ne: '' } });
		// const makes = await Listings.distinct('make');
		res.status(200).send({ data: makes });
		// set the data in redis
		await redisClient.setEx(
			'allMakesUnique',
			60 * 60 * 12,
			JSON.stringify({ data: makes })
		);
	} catch (error) {
		next(error);
	}
};
