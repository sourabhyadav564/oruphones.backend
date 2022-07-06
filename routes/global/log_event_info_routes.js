const express = require("express");
const eventModal = require("../../src/database/modals/others/event_logs");
const router = express.Router();

const logEvent = require("../../src/middleware/event_logging");

router.get("/logeventinfo", async (req, res) => {
  const userUniqueId = req.headers.useruniqueid;
  const events = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  const getEvent = await eventModal.findOne({ sessionId: sessionId });
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
        res.status(200).send({
          status: "SUCCESS",
          statusCode: 200,
          reason: "Event logged successfully",
        });
      } 
    } else {
      res.status(200).send({
        status: "SESSION_INVALID",
        statusCode: 200,
        reason: "User session invalid",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
