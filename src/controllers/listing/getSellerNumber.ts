import Requests from '@/database/modals/device/request_verification_save';
import Listings from '@/database/modals/device/save_listing_device';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	listingId: z.string(),
});

export default async function getSellerNumber(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingId } = validator.parse(req.body);
		// if number of requests in the last 24 hours is >15, return error
		const reqCount = await Requests.countDocuments({
			userUniqueId: req.session.user?.userUniqueId!,
		});
		if (reqCount > 15) {
			return res.status(400).json({
				reason: 'You have exceeded the number of requests for today',
			});
		}
		// else, create a new request
		const request = await Requests.create({
			userUniqueId: req.session.user?.userUniqueId!,
			listingId,
			mobileNumber: req.session.user?.mobileNumber!,
		});
		// return the number
		const listing = await Listings.findOne({
			listingId,
		});
		if (!listing) {
			return res.status(400).json({
				reason: 'Listing not found',
			});
		}
		return res.status(200).json({
			mobileNumber: listing.mobileNumber,
		});
	} catch (err) {
		next(err);
	}
}
