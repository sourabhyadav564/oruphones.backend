const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const cityModal = require("../../src/database/modals/global/cities_modal");
const logEvent = require("../../src/middleware/event_logging");

router.get("/cities", async (req, res) => {
  try {
    let dataObject = [];
    dataObject.push({
      _id: "627ff0daad80a210af722de4675f8f8f",
      displayWithImage: "0",
      city: "India",
    });
    let dataObject2 = await cityModal.find();
    dataObject = dataObject.concat(dataObject2);
    res.status(200).json({
      reason: "Cities found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
