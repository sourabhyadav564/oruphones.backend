import { Request, Response } from 'express';

export default async function isLoggedIn(req: Request, res: Response) {
	console.log(req.sessionID, 'req.sessionID');
	res.status(200).json({
		isLoggedIn: req.session.user ? true : false,
		...(req.session.user && {
			user: req.session.user,
		}),
	});
}
