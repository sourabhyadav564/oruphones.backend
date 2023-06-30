import saveRequestModal from '@/database/modals/device/request_verification_save';
import saveListingModal from '@/database/modals/device/save_listing_device';
import Users from '@/database/modals/login/login_create_user';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import { NextFunction, Request, Response } from 'express';

export default async function deleteUser(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		// mark all user's listings as expired
		await Promise.all([
			Users.findOneAndUpdate(
				{ userUniqueId: req.session.user!.userUniqueId },
				{ $set: { isaccountexpired: true } }
			),
			saveRequestModal.deleteMany({
				userUniqueId: req.session.user!.userUniqueId,
			}),
			bestDealsModal.updateMany(
				{ userUniqueId: req.session.user!.userUniqueId },
				{ $set: { status: 'Sold_Out' } }
			),
			saveListingModal.updateMany(
				{ userUniqueId: req.session.user!.userUniqueId },
				{ $set: { status: 'Sold_Out' } }
			),
		]);
		// update session
		req.session.user = undefined;
		return res.status(200).json({ message: 'User deleted' });
	} catch (error) {
		next(error);
	}
}
