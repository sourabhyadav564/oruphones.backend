const eventModal = require("../database/modals/others/event_logs");
const moment = require("moment");

const logEvent = async (req, res, next) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;

  const getEvent = await eventModal.findOne({ sessionId: sessionId });
  const currentTime = moment(Date.now()).format("LTS");
  const expirationTime = moment(
    getEvent?.createdAt?.setHours(getEvent?.createdAt.getHours() + 4)
  ).format("LTS");

  try {
    if (getEvent) {
      const eventData = getEvent.events;
      console.log("eventData", eventData);

      if (userUniqueId === getEvent.userUniqueId || userUniqueId === "Guest") {
        const updateEvent = await eventModal.findByIdAndUpdate(
          getEvent._id,
          {
            $push: {
              events: {
                eventName: events,
              },
            },
          },
          { new: true }
        );
        console.log("updateEvent", updateEvent);
      } else {
        res.status(200).send({
          status: "FAILED",
          statusCode: 200,
          reason: "User not authorized to log event",
        });
      }
      next();
    } else {
      res.status(301).send({
        status: "SESSION_INVALID",
        statusCode: 301,
        reason: "User session invalid",
      });
      return;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = logEvent;
