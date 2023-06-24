import EventModal from '@/database/modals/others/event_logs';
import { NextFunction, Request, Response } from 'express';

export default async function eventLogger(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (!req.cookies.session || req.useragent!.browser === 'unknown') {
		// api calls not from browser nor SSR
		return next();
	}
	try {
		let sessionEvent = await EventModal.findOne({
			sessionID: req.sessionID,
		});
		if (!sessionEvent || sessionEvent === undefined || sessionEvent === null) {
			console.log(
				`Session not found, generating new session for sessionID: `,
				req.sessionID
			);
			sessionEvent = new EventModal({
				sessionID: req.sessionID.toString(),
				devicePlatform: req.useragent!.platform,
				location: req.cookies.location || null,
				srcFrom: req.useragent?.isMobile ? 'MOBILE WEB' : 'DESKTOP WEB',
			});
		}
		sessionEvent.events.push({
			eventName: `${req.method} ${req.originalUrl} ${res.statusCode}}`,
		});
		await sessionEvent.save();
		console.log(sessionEvent, 'sessionEvent');
		next();
	} catch (err) {
		next(err);
	}
}
