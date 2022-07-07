const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

require("../../src/database/connection");
const logEvent = require("../../src/middleware/event_logging");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");

router.get("/getinfotemplates", async (req, res) => {
  try {
    let dataObject = {};
    dataObject["serverUrl"] = process.env.SERVER_URL;
    dataObject["templateUrls"] = {
      "VERIFICATION": "/verification.html",
      "CONDITIONS": "/condition.html",
      "TERMS_CONDITIONS": "/terms_conditions.html",
      "FAQ": "/faq",
      "ABOUT_US": "/about-us",
      "WARRANTY": "/warranty",
      "HOW_TO_BUY": "/how-to-buy",
      "HOW_TO_SELL": "/how-to-sell",
    }
    res.status(200).json({
      reason: "Product link generated successfully",
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
