import { Request, Response } from 'express';
import Listings from '@/database/modals/others/best_deals_models';
import getDefaultImage from '@/utils/get_default_image';
import { z } from 'zod';

const validator = z.object({
	make: z.string().min(1).max(100),
	count: z.number().min(1).max(25).optional(),
});

export default async (req: Request, res: Response) => {
	try {
		const { make } = validator.parse(req.body);
		const count = req.body.count || 5;
		//get top 5 unique list of models for a given make, along with its display image
		const models = await Listings.aggregate([
			{ $match: { make } },
			{ $group: { _id: '$model' } },
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
	} catch (error) {
		res.status(400).send({ message: 'Internal server error' });
	}
};
