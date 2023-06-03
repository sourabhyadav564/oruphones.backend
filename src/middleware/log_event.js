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
		if (process.env.EVENT === 'Active') {
			if (getEvent) {
				const eventData = getEvent.events;
				const updateEvent = await eventModal.findByIdAndUpdate(
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
				next();
			} else {
				const newEvent = new eventModal({
					sessionId: sessionId,
					userUniqueId: userUniqueId,
					location: location,
					devicePlatform: devicePlatform,
					srcFrom: srcFrom,
					events: [{ eventName: events }],
				});
				await newEvent.save();
				next();
			}
		} else {
			next();
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = logEvent;
