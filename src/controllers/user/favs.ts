import favoriteModal from '@/database/modals/favorite/favorite_add';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validator = z.object({
	listingId: z.string(),
	isFav: z.boolean(),
});
export default async function favs(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingId, isFav } = validator.parse(req.body);
		await favoriteModal.updateOne(
			{
				userUniqueId: req.session.user?.userUniqueId,
			},
			{
				...(isFav
					? {
							$push: {
								fav_listings: listingId,
							},
					  }
					: { $pull: { fav_listings: listingId } }),
			}
		);
		// update the session
		req.session.user = {
			...req.session.user,
			favListings: isFav
				? [...req.session.user?.favListings!, listingId]
				: req.session.user?.favListings!.filter((id) => id !== listingId),
		};
		return res.json({
			success: true,
		});
	} catch (err) {
		next(err);
	}
}
