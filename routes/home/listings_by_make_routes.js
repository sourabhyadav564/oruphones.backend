const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const listingByMakeModal = require("../../src/database/modals/listing/listing_by_make");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const getBestDeals = require("../../utils/get_best_deals");
// const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/listingsbymake", async (req, res) => {
  const initialMake = req.query.make;
  const userUniqueId = req.query.userUniqueId;
  const location = req.query.listingLocation;

  let make;
  initialMake.split(" ").map((currentValue) => {
    make = currentValue[0].toUpperCase() + currentValue.slice(1);
  });

  let defaultDataObject = [];
  if (location === "India") {
    let defaultDataObject2 = await saveListingModal.find({
      make: make,
      status: "Active"
    });
    defaultDataObject2.forEach((element) => {
      defaultDataObject.push(element);
    });
    const thirdPartyVendors = await getThirdPartyVendors("", make);
    thirdPartyVendors.forEach((thirdPartyVendor) => {
      defaultDataObject.push(thirdPartyVendor);
    });
  } else {
    let defaultDataObject2 = await saveListingModal.find({
      listingLocation: location,
      make: make,
      status: "Active"
    });
    if (!defaultDataObject2.length) {
      res.status(200).json({
        reason: "No best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          otherListings: [],
          bestDeals: [],
        },
      });
      return;
    } else {
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      const thirdPartyVendors = await getThirdPartyVendors("", make);
      thirdPartyVendors.forEach((thirdPartyVendor) => {
        defaultDataObject.push(thirdPartyVendor);
      });
    }
  }

  getBestDeals(defaultDataObject, userUniqueId, res, false);
});

router.get("/listbymarketingname", async (req, res) => {
  const marketingname = req.query.marketingName;
  const userUniqueId = req.query.userUniqueId;
  const location = req.query.location;

  let defaultDataObject = [];
  if (location === "India") {
    let defaultDataObject2 = await saveListingModal.find({
      marketingName: marketingname,
      status: "Active"
    });
    defaultDataObject2.forEach((element) => {
      defaultDataObject.push(element);
    });
    const thirdPartyVendors = await getThirdPartyVendors(marketingname, "");
    thirdPartyVendors.forEach((thirdPartyVendor) => {
      defaultDataObject.push(thirdPartyVendor);
    });
  } else {
    let defaultDataObject2 = await saveListingModal.find({
      listingLocation: location,
      marketingName: marketingname,
      status: "Active"
    });
    if (!defaultDataObject2.length) {
      res.status(200).json({
        reason: "No best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          otherListings: [],
          bestDeals: [],
        },
      });
      return;
    } else {
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      const thirdPartyVendors = await getThirdPartyVendors(marketingname, "");
      thirdPartyVendors.forEach((thirdPartyVendor) => {
        defaultDataObject.push(thirdPartyVendor);
      });
    }
  }

  getBestDeals(defaultDataObject, userUniqueId, res, false);
});

module.exports = router;
