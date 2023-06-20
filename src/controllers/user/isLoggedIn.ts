import { Request, Response } from "express";

export default async function isLoggedIn(req: Request, res: Response) {
	if (req.session.user) {
		res.status(200).json({ isLoggedIn: true });
	} else {
		res.status(200).json({ isLoggedIn: false });
	}
}
