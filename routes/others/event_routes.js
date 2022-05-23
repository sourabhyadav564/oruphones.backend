const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const eventModal = require("../../src/database/modals/others/event_logs");

router.get("/sessionid", async (req, res) => {
  const userUniqueId = req.headers.useruniqueid;
  const eventName = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  // console.log("eventName", eventName);

  try {
    const getEventDocs = await eventModal.findOne({
      sessionId: sessionId,
      userUniqueId: userUniqueId,
    });

    if (getEventDocs) {
      res.status(200).json({
        reason: "Session already exist",
        statusCode: 200,
        status: "SUCCESS",
      });
    } else {
      const headerInfo = {
        userUniqueId: userUniqueId,
        events: {
          eventName: eventName,
        },
        srcFrom: srcFrom,
        sessionId: sessionId,
      };
      const eventModalObject = new eventModal(headerInfo);
      const dataObject = await eventModalObject.save();
      res.status(201).json({
        reason: "Session created successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
