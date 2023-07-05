import { Request, Response } from 'express';

export default async function logout(req: Request, res: Response) {
	req.session.user = undefined;
	res
		.header('Cache-Control', 'no-cache, no-store, must-revalidate')
		.status(200)
		.json({ isLoggedIn: false });
}
