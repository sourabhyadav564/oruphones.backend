const eventModal = require('../../src/database/modals/others/event_logs');
const moment = require('moment');
const dotenv = require('dotenv');
const useragent = require('useragent');
dotenv.config();

const logEvent = async (req, res, next) => {
	const userUniqueId = req.session.User.userUniqueId;
	const events = req.headers.eventname;
	const sessionId = req.sessionID;
	const location = req.headers.location;
	const devicePlatform = req.headers.deviceplatform;

	const userAgentString = req.headers['user-agent'];
	const userAgent = useragent.parse(userAgentString);

	const srcFrom = userAgent.source;

	const getEvent = await eventModal.findOne({ userUniqueId: userUniqueId });
	const currentTime = moment(Date.now()).format('LTS');
	const expirationTime = moment(
		getEvent?.createdAt?.setHours(getEvent?.createdAt.getHours() + 4)
	).format('LTS');

	try {
		const userUniqueId = req.session.User.userUniqueId;
		const sessionId = req.sessionID;
		const eventName = req.headers.eventname;
		const srcFrom = req.headers.srcfrom;
		const devicePlatform = req.headers.deviceplatform;
		const location = req.headers.location;

		if (!userUniqueId) {
			// User is not logged in
			if (!sessionId) {
				res.status(400).json({
					reason: 'Session ID is required for guest session',
					statusCode: 400,
					status: 'FAILURE',
				});
				return;
			}

			const guestSession = await eventModal.findOne({
				sessionId,
				userUniqueId: 'guest',
			});

			if (guestSession) {
				// Guest session already exists, append event
				guestSession.events.push({
					eventName,
				});
				await guestSession.save();

				next();
			} else {
				// Create new guest session
				const headerInfo = {
					userUniqueId: 'guest',
					events: [
						{
							eventName,
						},
					],
					srcFrom,
					sessionId,
					devicePlatform,
					location,
				};
				const guestSessionObject = new eventModal(headerInfo);
				const savedGuestSession = await guestSessionObject.save();

				next();
			}
		} else {
			// User is logged in
			const userSession = await eventModal.findOne({
				userUniqueId,
			});
			if (userSession) {
				// User session already exists, append event
				userSession.events.push({
					eventName,
				});
				await userSession.save();

				next();
			} else {
				// Create new user session
				const headerInfo = {
					userUniqueId,
					events: [
						{
							eventName,
						},
					],
					srcFrom,
					sessionId,
					devicePlatform,
					location,
				};
				const userSessionObject = new eventModal(headerInfo);
				const savedUserSession = await userSessionObject.save();

				next();
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
};

module.exports = logEvent;
