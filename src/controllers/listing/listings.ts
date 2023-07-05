import saveListingModal from '@/database/modals/device/save_listing_device';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// get an array of listing id strings
const validator = z.object({ listingIds: z.string().array() });

export default async function listings(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingIds } = validator.parse(req.body);
		const listings = await saveListingModal
			.find({
				listingId: {
					$in: listingIds,
				},
			})
			.lean();
		return res.status(200).json({
			data: listings,
		});
	} catch (err) {
		next(err);
	}
}
