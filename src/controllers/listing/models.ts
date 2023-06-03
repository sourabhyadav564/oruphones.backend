import Listings from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import getDefaultImage from '@/utils/get_default_image';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	make: z.string().min(1).max(100),
	count: z.number().min(1).max(25).optional(),
});

export default async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { make } = validator.parse(req.body);
		const count = req.body.count || 5;
		// check if redis has the data
		let redisResponse = await redisClient.get(`${make}models-${count}`);
		if (redisResponse !== null) {
			console.log('This response was powered by redis');
			res.status(200).json(JSON.parse(redisResponse));
			return;
		}
		//get  unique list of models for a given make, along with its display image, sorted by count
		const models = await Listings.aggregate([
			{ $match: { make } },
			{ $group: { _id: '$model', count: { $sum: 1 } } }, // sortByCount stage
			{ $sort: { count: -1 } },
			{ $limit: count },
		]);
		// for each model, use get_default_image to get the display image and append it to the model object using promise.all
		const modelsWithImages = await Promise.all(
			models.map(async (model) => {
				const image = await getDefaultImage(model._id);
				return {
					model: model._id,
					image,
				};
			})
		);
		res.status(200).send({ data: modelsWithImages });
		// set the data in redis
		await redisClient.setEx(
			`${make}models-${count}`,
			60 * 60 * 12,
			JSON.stringify({ data: modelsWithImages })
		);
	} catch (error) {
		next(error);
	}
};
