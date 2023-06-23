import listings from './listings';
import filterController from '@/controllers/listing/filter';
import makes from '@/controllers/listing/makes';
import models from '@/controllers/listing/models';
import Listing from '@/database/modals/others/best_deals_models';
import redisClient from '@/database/redis';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const stateAreaModal = require('@/database/modals/global/locations/state');
const cityAreaModal = require('@/database/modals/global/locations/city');
const AreaModal = require('@/database/modals/global/locations/area');

const validator = z.object({
	locationId: z.number().min(1).max(100000000),
	locationType: z.string().min(1).max(100),
	count: z.number().min(1).max(100),
});

// async function fetchLocationIds(locationType: String, locationId: Number) {
// 	let LocationIds = [];

// 	if (locationType === 'city') {
// 		LocationIds.push(locationId);
// 		const parentDataFromArea = await AreaModal.find({
// 			parentId: locationId,
// 		}).exec();
// 		parentDataFromArea.map((element: any) => LocationIds.push(element.id));
// 	} else if (locationType === 'area') {
// 		const parentDataFromArea = await AreaModal.findOne({
// 			id: locationId,
// 		}).exec();

// 		const otherListingsFromArea = await AreaModal.find({
// 			parentId: parentDataFromArea.parentId,
// 		}).exec();
// 		otherListingsFromArea.map((element: any) => LocationIds.push(element.id));
// 	}

// 	return LocationIds;
// }
async function fetchLatLong(
	locationType: string,
	locationId: number
): Promise<{ lat: string; long: string }> {
	let location = { lat: '', long: '' };

	if (locationType === 'City' || locationType === 'city') {
		const dataFromCity = await cityAreaModal.findOne({ id: locationId }).exec();

		if (dataFromCity) {
			console.log(dataFromCity)
			location.lat = dataFromCity.latitude;
			location.long = dataFromCity.longitude;
		}
	} else if (locationType === 'Area' || locationType === 'area') {
		const dataFromArea = await AreaModal.findOne({ id: locationId }).exec();
		if (dataFromArea) {
			location.lat = dataFromArea.latitude;
			location.long = dataFromArea.longitude;
		}
	}

	return location;
}

async function topSellingHome(req: Request, res: Response, next: NextFunction) {
	try {
		let { locationId, locationType, count } = validator.parse(req.body);
        console.log(locationId, locationType, count )
		let { lat, long } = await fetchLatLong(locationType, locationId);

		const key = `listing/topsellingHome/${locationId}}`;
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
		};

		let topSelling = await Listing.find(
			{
				location: {
					$near: {
						$geometry: { type: 'Point', coordinates: [long, lat] },
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
		console.log(error)
	}
}

export default {
	topSellingHome,
	filter: filterController,
	models,
	makes,
	listings,
};
