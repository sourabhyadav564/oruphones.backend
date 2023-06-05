const eventModal = require('../../src/database/modals/others/event_logs');
const dotenv = require('dotenv');
dotenv.config();

const logEvent = async (req, res, next) => {
	const { userUniqueId, events, srcFrom, sessionId, location, devicePlatform } =
		req.headers;
	const getEvent = await eventModal.findOne({ sessionId: sessionId });
	try {
		if (getEvent) {
			console.log('getEvent', getEvent);
			await eventModal.findByIdAndUpdate(
				getEvent._id,
				{
					userUniqueId: userUniqueId,
					location: location,
					devicePlatform: devicePlatform,
					srcFrom: srcFrom,
					$push: {
						events: {
							eventName: events,
						},
					},
				},
				{ new: true }
			);
		}
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = logEvent;
