const express = require("express");
const router = express.Router();

const logEvent = require("../../src/middleware/event_logging");

router.get("/logeventinfo", async (req, res) => {
  try {
    res.status(200).send({
        status: "SUCCESS",
        statusCode: 200,
        reason: "Event logged successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
