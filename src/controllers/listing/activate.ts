import saveListingModal from '@/database/modals/device/save_listing_device';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	listingId: z.string(),
});

export default async function activateListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingId } = validator.parse(req.body);
		// stop user to save activated listing if he/she already has 5 unverified listings
		const count = await saveListingModal.countDocuments({
			userUniqueId: req.session.user!.userUniqueId,
			verified: false,
		});
		if (count > 5) {
			return res.status(400).json({
				message:
					'You are not allowed to activate more then 5 unverified listings.',
			});
		}
		// stop user to save duplicate activated listing on basis of mobileNumber, marketingName, storage & ram
		const listing = await saveListingModal.findOne({
			listingId,
		});
		if (!listing) {
			return res.status(400).json({
				message: 'Listing not found',
			});
		}
		if (listing.userUniqueId !== req.session.user!.userUniqueId) {
			return res.status(400).json({
				message: 'You are not allowed to activate this listing',
			});
		}
		const isDuplicated =
			(await saveListingModal.findOne({
				userUniqueId: req.session.user!.userUniqueId,
				verified: false,
				deviceStorage: listing.deviceStorage,
				deviceRam: listing.deviceRam,
				marketingName: listing.marketingName,
				status: 'Active',
			})) === null
				? false
				: true;

		if (isDuplicated) {
			return res.status(400).json({
				message:
					'Looks like your activated listing for this device is available on our platform. Please verify your listing.',
			});
		}
		// activate listing and update bestDeals modal
		const [_, bestDeals] = await Promise.all([
			saveListingModal.updateOne(
				{
					listingId,
				},
				{
					status: 'Active',
				}
			),
			bestDealsModal.findOne({
				listingId,
			}),
		]);

		if (bestDeals) {
			bestDeals.status = 'Active';
			await bestDeals.save();
		} else {
			await bestDealsModal.create({
				...listing,
				status: 'Active',
			});
		}

		res.status(200).json({
			reason:
				'Listing activated successfully\nIt will be appear on marketplace within 24 hours.',
			statusCode: 200,
			status: 'SUCCESS',
		});
	} catch (error) {
		next(error);
	}
}
