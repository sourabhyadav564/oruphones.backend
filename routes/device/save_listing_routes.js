const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.get("/listing", logEvent, async (req, res) => {
  try {
    const listingId = req.query.userUniqueId;
    const dataObject = await saveListingModal.findById(listingId);

    if (!dataObject) {
      res.status(404).json({ message: "Listing not found" });
      return;
    } else {
      res.status(200).json({
        reason: "Listing found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/listing/save", async (req, res) => {
    const modalInfo = new saveListingModal(req.body);
    try {
        const dataObject = await modalInfo.save();
        res
      .status(201)
      .json({
        reason: "Modal list created",
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
