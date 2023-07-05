import saveListingModal from '@/database/modals/device/save_listing_device';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';


const validator = z.object({
	make: z.string().min(1).max(255),
	marketingName: z.string().min(1).max(255),
	model: z.string().min(1).max(255),
	charger: z.string().min(1).max(255),
	earphone: z.string().min(1).max(255),
	originalBox: z.string().min(1).max(255),
	deviceCondition: z.string().min(1).max(255),
	deviceStorage: z.string().min(1).max(255),
	deviceRam: z.string().min(1).max(255),
	images: z.any().array(),
	listingPrice: z.number().min(1).max(1000000),
	warranty: z.string(),
	latlong: z.object({
		longitude: z.number().min(-180).max(180),
		latitude: z.number().min(-90).max(90),
	}),
	state: z.string().min(1).max(255),
	locality: z.string().min(1).max(255),
	listingLocation: z.string().min(1).max(255),
	cosmetic: z.object({
		'0': z.string().min(1).max(255),
		'1': z.string().min(1).max(255),
		'2': z.string().min(1).max(255),
	}),
});

export type AddListingBody = z.infer<typeof validator>;

export default async function addListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const body = validator.parse(req.body);
		const limitExceeded =
			(await saveListingModal.find().countDocuments({
				userUniqueId: req.session.user?.userUniqueId,
				verified: false,
				status: 'Active',
			})) >= 5;
		if (limitExceeded) {
			return res.status(400).json({
				message: 'You have exceeded the limit of 5 listings',
			});
		}
		const duplicate = await saveListingModal.findOne({
			userUniqueId: req.session.user?.userUniqueId,
			marketingName: body.marketingName,
			deviceStorage: body.deviceStorage,
			deviceRam: body.deviceRam,
			verified: false,
		});
		if (duplicate) {
			return res.status(400).json({
				message: 'Duplicate listing',
			});
		}
		// create a new listing in saveListingModal and BestDealsModal
		await Promise.all([
			saveListingModal.create({
				...body,
				latLong: undefined,
				location: [body.latlong.longitude, body.latlong.latitude],
				userUniqueId: req.session.user?.userUniqueId,
				verified: false,
				status: 'Active',
			}),
			bestDealsModal.create({
				...body,
				latLong: undefined,
				location: [body.latlong.longitude, body.latlong.latitude],
				userUniqueId: req.session.user?.userUniqueId,
				verified: false,
				status: 'Active',
			}),
		]);
	} catch (error) {
		next(error);
	}
}