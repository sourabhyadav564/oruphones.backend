import Users from '@/database/modals/login/login_create_user';
import { NextFunction, Request, Response } from 'express';

export default async function imageUpload(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { profilePic } = req.query;
		if (profilePic) {
			const response = await Users.findOneAndUpdate(
				{ userUniqueId: req.session.user!.userUniqueId },
				{
					profilePicPath: (req.file as any)?.transforms[0].location,
				},
				{ new: true }
			);
			// Update user in req.session.user
			req.session.user = {
				...req.session.user,
				profilePicPath: (req.file as any)?.transforms[0].location,
			};
			return res.status(200).json({
				reason: 'User details updated successfully',
				status: 'SUCCESS',
				profilePicPath: (req.file as any)?.transforms[0].location,
			});
		}
	} catch (err) {
		next(err);
	}
}
