import { NextFunction, Request, Response } from 'express';

export default function isAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (req.session.User) {
		next();
	} else {
		res.status(401).json({ message: 'Unauthorized' });
	}
}
