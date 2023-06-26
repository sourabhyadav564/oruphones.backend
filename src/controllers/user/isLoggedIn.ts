import { Request, Response } from 'express';

export default async function isLoggedIn(req: Request, res: Response) {
	res.status(200).json({
		isLoggedIn: req.session.user ? true : false,
		...(req.session.user && {
			user: { ...req.session.user, userUniqueId: undefined },
		}),
	});
}
