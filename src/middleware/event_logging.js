const eventModal = require("../database/modals/others/event_logs");
const moment = require("moment");
const dotenv = require("dotenv");
const createUserModal = require("../database/modals/login/login_create_user");
dotenv.config();

const logEvent = async (req, res, next) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  const location = req.headers.location;
  const devicePlatform = req.headers.devicePlatform;

  const getEvent = await eventModal.findOne({ sessionId: sessionId });
  // const getUser = await createUserModal.findOne({
  //   userUniqueId: userUniqueId,
  // });
  const currentTime = moment(Date.now()).format("LTS");
  const expirationTime = moment(
    getEvent?.createdAt?.setHours(getEvent?.createdAt.getHours() + 4)
  ).format("LTS");

  try {
    if (process.env.EVENT === "Active") {
      // if (!getUser) {
      //   res.status(200).send({
      //     status: "INVALID_USER",
      //     statusCode: 200,
      //     reason: "User not found",
      //   });
      //   return;
      // } else 
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
        // res.status(200).send({
        //   status: "SESSION_INVALID",
        //   statusCode: 200,
        //   reason: "User session invalid",
        // });
        // return;
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
