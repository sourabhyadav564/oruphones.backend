import notificationModel from '@/database/modals/notification/complete_notifications';
import { NextFunction, Request, Response } from 'express';

export async function getNotifications(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const notifs = await notificationModel
			.findOne({ user: req.session.user?.userUniqueId! })
		res.json({
			notifs,
		});
	} catch (err) {
		next(err);
	}
}

export async function modifyNotifs(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { notifId, action } = req.body;
		const notifs = await notificationModel.findOne({
			user: req.session.user?.userUniqueId!,
		});
		if (!notifs) {
			throw new Error('Notification not found');
		}
		if (action === 'read') {
			// update the notifs.notification array, where notificationId === notifId to isUnRead = 1
			const notifIndex = notifs.notification.findIndex(
				(notif) => notif.notificationId === notifId
			);
			if (notifIndex === -1) {
				throw new Error('Notification not found');
			}
			notifs.notification[notifIndex].isUnRead = 1;
		}
		if (action === 'delete') {
			let prev = notifs.notification.length;
			notifs.notification = notifs.notification.filter(
				(notif) => notif.notificationId !== notifId
			);
			if (prev === notifs.notification.length) {
				throw new Error('Notification not found');
			}
		}
		await notifs.save();
		res.json({
			message: 'Notification updated',
		});
	} catch (err) {
		next(err);
	}
}

export default {
	getNotifications,
	modifyNotifs,
};
