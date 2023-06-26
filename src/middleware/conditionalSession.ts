import session from '@/utils/sessionStore';
import { NextFunction, Request, Response } from 'express';

export default async function conditionalSession(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (req.useragent!.browser === 'unknown') {
		return next();
	}
	console.log('is Client');
	session(req, res, next);
}
