const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const eventModal = require("../../src/database/modals/others/event_logs");

router.post("/sessionid", async (req, res) => {

  const headerInfo = {
    userUniqueId: req.headers.useruniqueid,
    events: req.headers.eventname,
    srcFrom: req.headers.srcfrom,
    sessionId
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

// router.patch("/sessionid", async (req, res) => {
//   try {
//     const eventId = req.headers.sessionid;

//     const document = await eventModal.findOne({ eventId });

//     const arr = [];
//     document.events.forEach(element => {
//       arr.push(element);
//     });
//     arr.push(req.headers.eventname);

//     const eventData = {
//       events: arr,
//     };

//     const updateEvent = await eventModal.findOneAndUpdate(eventId, eventData, {
//       new: true,
//     });
//     if (!updateEvent) {
//       res.status(404).json({ message: "Event not found" });
//       return;
//     } else {
//       res
//         .status(200)
//         .json({ message: "Event updated successfully", updateEvent });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// });

module.exports = router;
