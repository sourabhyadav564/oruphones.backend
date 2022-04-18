const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const eventModal = require("../../src/database/modals/others/event_logs");

router.post("/sessionid", async (req, res) => {

  const userUniqueId = req.headers.useruniqueid;
  const eventName = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;

  const headerInfo = {
    userUniqueId: userUniqueId,
    events: eventName,
    srcFrom: srcFrom,
    sessionId: sessionId,
  };

  const eventModalObject = new eventModal(headerInfo);

  try {
    const dataObject = await eventModalObject.save();
    res.status(201).json({
      reason: "Session created successfully",
      statusCode: 201,
      status: "SUCCESS",
      dataObject,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
