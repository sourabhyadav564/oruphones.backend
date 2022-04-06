const express = require("express");
const router = express.Router();
const randomString = require("../../utils/random");

require("../../src/database/connection");
const eventModal = require("../../src/database/modals/others/event_logs");
const validatedSessionId = require("../../utils/random");

// router.get("/events", async (req, res) => {
//   try {
//     const listingId = req.query.userUniqueId;
//     const dataObject = await saveListingModal.findById(listingId);

//     if (!dataObject) {
//       res.status(404).json({ message: "Listing not found" });
//       return;
//     } else {
//       res.status(200).json({
//         reason: "Listing found successfully",
//         statusCode: 200,
//         status: "SUCCESS",
//         dataObject,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// });

router.post("/sessionid", async (req, res) => {

  let rString = randomString(
    12,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );

  const document = await eventModal.findOne({ sessionId: rString });
  if(document){
    let newRandomString = randomString(
      12,
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    rString = newRandomString;
  } else {
    return;
  }

  // const rString = validatedSessionId();

  const headerInfo = {
    userUniqueId: req.headers.useruniqueid,
    events: req.headers.eventname,
    srcFrom: req.headers.srcfrom,
    sessionId: rString,
  };

  const eventModalObject = new eventModal(headerInfo);

  try {
    const dataObject = await eventModalObject.save();
    res.status(201).json({
      reason: "Event logged successfully",
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

router.patch("/sessionid", async (req, res) => {
  try {
    const eventId = req.headers.sessionid;

    const document = await eventModal.findOne({ eventId });

    const arr = [];
    document.events.forEach(element => {
      arr.push(element);
    });
    arr.push(req.headers.eventname);

    const eventData = {
      events: arr,
    };

    const updateEvent = await eventModal.findOneAndUpdate(eventId, eventData, {
      new: true,
    });
    if (!updateEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    } else {
      res
        .status(200)
        .json({ message: "Event updated successfully", updateEvent });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
