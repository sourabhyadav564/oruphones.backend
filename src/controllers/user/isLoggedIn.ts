import { Request, Response } from 'express';

export default async function isLoggedIn(req: Request, res: Response) {
	if (req.session.User) {
		res
			.header('Cache-Control', 'no-cache, no-store, must-revalidate')
			.status(200)
			.json({ isLoggedIn: true });
	} else {
		res
			.header('Cache-Control', 'no-cache, no-store, must-revalidate')
			.status(200)
			.json({ isLoggedIn: false });
	}
}
