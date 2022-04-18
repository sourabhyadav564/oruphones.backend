const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const brandModal = require("../../src/database/modals/master/master_brands");
const logEvent = require("../../src/middleware/event_logging");

router.get("/brands", logEvent, async (req, res) => {
  try {
    const dataObject = await brandModal.find();
    res
      .status(200)
      .json({
        reason: "Brands found",
        statusCode: 200,
        status: "SUCCESS",
        clientIp: req.socket.remoteAddress,
        dataObject,
      });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
