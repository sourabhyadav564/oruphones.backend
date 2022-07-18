const eventModal = require("../database/modals/others/event_logs");
const moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();

const logEvent = async (req, res, next) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  const location = req.headers.location;
  const devicePlatform = req.headers.devicePlatform;

  const getEvent = await eventModal.findOne({ sessionId: sessionId });
  const currentTime = moment(Date.now()).format("LTS");
  const expirationTime = moment(
    getEvent?.createdAt?.setHours(getEvent?.createdAt.getHours() + 4)
  ).format("LTS");

  try {
    if (process.env.EVENT === "Active") {
      if (getEvent) {
        const eventData = getEvent.events;
        console.log("eventData", eventData);

        // if (userUniqueId === getEvent.userUniqueId || userUniqueId === "Guest") {
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
        console.log("updateEvent", updateEvent);
        // } else {
        //   console.log("Event can't be updated");
        // }
        next();
      } else {
        res.status(200).send({
          status: "SESSION_INVALID",
          statusCode: 200,
          reason: "User session invalid",
        });
        return;
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = logEvent;
