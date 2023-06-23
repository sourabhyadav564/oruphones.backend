import createAgentModal from '@/database/modals/global/oru_mitra/agent_modal';
import Users from '@/database/modals/login/login_create_user';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const validator = z.object({
	userName: z.string().min(3).max(30).optional(),
	email: z.string().email().optional(),
	mobileNumber: z.string().min(10).max(10).optional(),
	isLinking: z.boolean().optional(),
	referral: z.string().optional(),
});

export default async function update(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userName, email, mobileNumber, isLinking, referral } =
			validator.parse(req.body);
		if (referral) {
			let referralUser = undefined;
			if (isLinking) {
				const referralUser = await createAgentModal.findOne({
					referralCode: referral,
					type: ['OruMitra', 'Broker'],
				});
				if (!referralUser) throw new Error('Invalid referral code');
			}
			await Users.findOneAndUpdate(
				{ userUniqueId: req.session.user!.userUniqueId },
				{
					$set: isLinking
						? { associatedWith: referralUser!.userUniqueId }
						: { associatedWith: '' },
				}
			);
			return res.status(200).json({
				reason: 'User details updated successfully',
				status: 'SUCCESS',
			});
		}
		// find and update using userUniqueId from req.session.user
		const response = await Users.findOneAndUpdate(
			{ userUniqueId: req.session.user!.userUniqueId },
			{
				...(userName && { userName }),
				...(email && { email }),
				...(mobileNumber && { mobileNumber }),
			},
			{ new: true }
		);
		// update user in req.session.user
		req.session.user = {
			...req.session.user,
			...(userName && { userName }),
			...(email && { email }),
			...(mobileNumber && { mobileNumber }),
		};
		res.status(200).json({
			reason: 'User details updated successfully',
			status: 'SUCCESS',
		});
	} catch (err) {
		next(err);
	}
}
