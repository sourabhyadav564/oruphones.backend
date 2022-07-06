const eventModal = require("../database/modals/others/event_logs");
const moment = require("moment");

const logEvent = async (req, res, next) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;

  const getEvent = await eventModal.findOne({sessionId: sessionId});
  const currentTime = moment(Date.now()).format("LTS");
  const expirationTime = moment(getEvent?.createdAt?.setHours(getEvent?.createdAt.getHours() + 4)).format("LTS");

  try {
    if (getEvent) {
      // if (currentTime > expirationTime) {
      //   res.status(301).send({
      //     status: "SESSION_EXPIRED",
      //     statusCode: 301,
      //     reason: "User session expired",
      //   });
      //   return;
      // } else {
        // const arr = [];
        // getEvent.events.forEach((item) => {
        //   arr.push(item);
        // });
        // // console.log("arr", arr);
        // arr.push({eventName: events});
        // // console.log("arr2", arr);
        // let eventData = {
        //   events: arr,
        // };

        // if(userUniqueId !== "Guest" && userUniqueId !== getEvent.userUniqueId) {
        //   eventData = {...eventData, userUniqueId: userUniqueId};
        // }

        const eventData = getEvent.events;

        console.log("eventData", eventData);

        // const updateEvent = await eventModal.findOneAndUpdate(
        //   sessionId,
        //   eventData,
        //   {
        //     new: true,
        //   }
        // );

        if (userUniqueId !== "Guest" && userUniqueId !== getEvent.userUniqueId) {
          const updateEvent = await eventModal.findByIdAndUpdate(
            getEvent._id,
            {
              $push: {
                events: {
                  eventName: events,
                }
              }
            },{ new: true }
          )
          console.log("updateEvent", updateEvent);
        }

        next();
      // }
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
