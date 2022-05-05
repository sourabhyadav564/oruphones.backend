const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const listingByMakeModal = require("../../src/database/modals/listing/listing_by_make");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.get("/listingsbymake", async (req, res) => {
  const make = req.query.make;
  const userUniqueId = req.query.userUniqueId;
  const listingLocation = req.query.listingLocation;

  let dataObject = {}

  try {
    const listings = await saveListingModal.find({
      make: make,
      listingLocation: listingLocation,
    });
    dataObject = {
      bestDeals: listings,
      otherListings: [] //TODO: other Listing should be added soon
    }
    res.status(200).json({
      reason: "Listings by make",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/listbymarketingname", async (req, res) => {
  const marketingName = req.query.marketingName;
  const userUniqueId = req.query.userUniqueId;
  const location = req.query.location;

  try {
    const listings = await saveListingModal.find({
      marketingName: marketingName,
      listingLocation: location,
    });
    res.status(200).json({
      reason: "Listings by marketing name",
      statusCode: 200,
      status: "SUCCESS",
      listings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
