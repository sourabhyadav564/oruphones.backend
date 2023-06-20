import { Request, Response } from 'express';

export default async function logout(req: Request, res: Response) {
	req.session.destroy((err) => {
		if (err) {
			res
				.header('Cache-Control', 'no-cache, no-store, must-revalidate')
				.status(500)
				.json({ isLoggedIn: true });
		} else {
			res
				.header('Cache-Control', 'no-cache, no-store, must-revalidate')
				.status(200)
				.json({ isLoggedIn: false });
		}
	});
}
