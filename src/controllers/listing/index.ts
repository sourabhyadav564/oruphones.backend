import activate from './activate';
import deleteListing from './delete';
import getSellerNumber from './getSellerNumber';
import listings from './listings';
import pause from './pause';
import sendVerification from './sendVerification';
import filterController from '@/controllers/listing/filter';
import makes from '@/controllers/listing/makes';
import models from '@/controllers/listing/models';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import { z } from 'zod';

const validator = z.object({
	locality: z.string().min(0).max(100).optional(),
	state: z.string().min(0).max(100),
	city: z.string().min(0).max(100),
	count: z.number().min(1).max(100),
});

async function topSellingHome(req: Request, res: Response, next: NextFunction) {
	try {
		console.log(req.body);
		const { locality, state, city, count } = validator.parse(req.body);
		// Check Redis for cached response
		const key = `topSelling::${locality}:${state}:${city}}`;
		//check redis for location
		let redisResponse = await redisClient.get(key);
		if (redisResponse !== null) {
			console.log('This response was powered by redis');
			res.status(200).json({ data: JSON.parse(redisResponse) });
			return;
		}

		const filter = {
			$or: [
				...(locality
					? [
							{
								listingLocality: locality,
								listingState: state,
								listingLocation: city,
							},
							{
								listingLocation: city,
								listingState: state,
							},
					  ]
					: [
							{
								listingLocation: city,
								listingState: state,
							},
					  ]),
				{
					listingLocation: 'India',
				},
			],
		};

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
			listingId: 1,
			verified: 1,
			imagePath: 1,
			status: 1,
		};

		//This below Pipeline Stage involves -
		// 1. Location based filtering (First Lcality based filterings after that City based filtering after that india listings)
		//    It assigns a priority value (1, 2, 3) to indicate the matching priority:
		//   a for matching listingLocality,
		//   b for matching listingLocation,
		//   c for matching 'India'.
		//   d If none of the cases match, the default value of 4 is used
		// 2. Sort of these listings according to notional percentage
		//   a. 0 to 40 in descending order
		//   b. less than 0 in ascending order
		//   c. more than 40 in ascending order
		const pipeline: PipelineStage[] = [
			{ $match: filter },
			{
				$addFields: {
					sortPriority: {
						$switch: {
							branches: [
								{
									case: {
										$and: [
											{ $gte: ['$notionalPercentage', 0] },
											{ $lt: ['$notionalPercentage', 40] },
										],
									},
									then: 0,
								},
								{
									case: { $lt: ['$notionalPercentage', 0] },
									then: 1,
								},
								{
									case: { $gte: ['$notionalPercentage', 40] },
									then: 2,
								},
							],
							default: 3,
						},
					},
					matchPriority: {
						$switch: {
							branches: [
								{
									case: { $eq: ['$listingLocality', locality] },
									then: 1,
								},
								{
									case: { $eq: ['$listingLocation', city] },
									then: 2,
								},
								{
									case: { $eq: ['$listingLocation', 'India'] },
									then: 3,
								},
							],
							default: 4,
						},
					},
				},
			},
			{
				$sort: {
					matchPriority: 1,
					sortPriority: 1,
					notionalPercentage: -1,
				},
			},

			{ $project: returnFilter },
		];

		let topSelling = await Listing.aggregate(pipeline).limit(count).exec();

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
	listings,
	sendVerification,
	getSellerNumber,
	activate,
	deleteListing,
	pause,
};
