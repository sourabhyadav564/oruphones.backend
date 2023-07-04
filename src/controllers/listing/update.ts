import saveListingModal from '@/database/modals/device/save_listing_device';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// TODO: rewrite to add a listing
const validator = z.object({
	charger: z.string().min(1).max(255).optional(),
	earphone: z.string().min(1).max(255).optional(),
	originalBox: z.string().min(1).max(255).optional(),
	deviceCondition: z.string().min(1).max(255).optional(),
	deviceStorage: z.string().min(1).max(255).optional(),
	deviceRam: z.string().min(1).max(255).optional(),
	images: z
		.array(
			z.object({
				thumbImage: z.string().min(1).max(255),
				fullImage: z.string().min(1).max(255),
			})
		)
		.optional(),
	listingPrice: z.number().min(1).max(1000000).optional(),
	warranty: z.string().optional(),
	latlong: z
		.object({
			longitude: z.number().min(-180).max(180),
			latitude: z.number().min(-90).max(90),
		})
		.optional(),
	listingState: z.string().min(1).max(255).optional(),
	listingLocality: z.string().min(1).max(255).optional(),
	listingId: z.string().min(1).max(255).optional(),
});

export type UpdateListingBody = z.infer<typeof validator>;

export default async function updateListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const body = validator.parse(req.body);
		const listing = await saveListingModal.findOne({
			listingId: body.listingId,
		});
		if (!listing || listing == null) {
			res.status(404).json({
				message: 'Listing not found',
			});
		}
		if (listing?.userUniqueId !== req.session.user?.userUniqueId) {
			res.status(403).json({
				message: 'You are not authorized to update this listing',
			});
		}
		await Promise.all([
			saveListingModal.updateOne(
				{
					listingId: body.listingId,
				},
				{
					...body,
					...(body.warranty
						? {
								warranty: body.warranty.includes('9')
									? 'zero'
									: body.warranty.includes('6')
									? 'four'
									: body.warranty.includes('3')
									? 'seven'
									: 'None',
						  }
						: {}),
				}
			),
			bestDealsModal.updateOne(
				{
					listingId: body.listingId,
				},
				{
					...body,
					...(body.warranty
						? {
								warranty: body.warranty.includes('9')
									? 'zero'
									: body.warranty.includes('6')
									? 'four'
									: body.warranty.includes('3')
									? 'seven'
									: 'None',
						  }
						: {}),
				}
			),
		]);

		res.status(200).json({
			message: 'Listing updated successfully',
		});
	} catch (error) {
		next(error);
	}
}
