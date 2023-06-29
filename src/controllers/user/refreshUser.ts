import saveRequestModal from '@/database/modals/device/request_verification_save';
import favoriteModal from '@/database/modals/favorite/favorite_add';
import Users from '@/database/modals/login/login_create_user';
import notificationModel from '@/database/modals/notification/complete_notifications';
import saveNotificationModel from '@/database/modals/notification/notification_save_token';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	forceNew: z.boolean(),
});

export default async function refreshUser(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { forceNew } = validator.parse(req.body);
		if (!forceNew) {
			// just flip the expired flag in user
			await Users.findOneAndUpdate(
				{ userUniqueId: req.session.user!.userUniqueId },
				{ $set: { isaccountexpired: false } }
			);
			return res.status(200).json({ message: 'User refreshed' });
		}
		// delete all traces of old user activity
		await Promise.all([
			favoriteModal.deleteMany({
				userUniqueId: req.session.user!.userUniqueId,
			}),
			notificationModel.deleteMany({
				userUniqueId: req.session.user!.userUniqueId,
			}),
			saveRequestModal.deleteMany({
				userUniqueId: req.session.user!.userUniqueId,
			}),
			saveNotificationModel.deleteMany({
				userUniqueId: req.session.user!.userUniqueId,
			}),
			Users.replaceOne(
				{ userUniqueId: req.session.user!.userUniqueId },
				{
					userUniqueId: req.session.user!.userUniqueId,
					isaccountexpired: false,
					mobileNumber: req.session.user!.mobileNumber,
					countryCode: req.session.user!.countryCode,
				}
			),
		]);

		// update session
		req.session.user = {
			userUniqueId: req.session.user!.userUniqueId,
			mobileNumber: req.session.user!.mobileNumber,
			favListings: [],
			userListings: [],
		};
		return res.status(200).json({ message: 'User refreshed' });
	} catch (error) {
		next(error);
	}
}
