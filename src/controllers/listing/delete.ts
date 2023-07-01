import saveListingModal from '@/database/modals/device/save_listing_device';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	listingId: z.string().nonempty(),
});

export default async function deleteListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingId } = validator.parse(req.body);
		const listing = await saveListingModal.findOne({ listingId });
		if (!listing || listing === null) {
			return res.status(404).json({
				message: 'Listing not found',
			});
		}
		if (listing.status === 'Sold_Out') {
			return res.status(400).json({
				message: 'Listing already sold out',
			});
		}
		// update saveListingModal and bestDealModal
		listing.status = 'Sold_Out';
		await listing.save();

		// update bestDealModal
		const bestDealsListing = await bestDealsModal.findOne({ listingId });
		if (bestDealsListing && bestDealsListing !== null) {
			bestDealsListing.status = 'Sold_Out';
			await bestDealsListing.save();
		}
		res.status(200).json({
			message: 'Listing deleted successfully',
		});
	} catch (error) {
		next(error);
	}
}
