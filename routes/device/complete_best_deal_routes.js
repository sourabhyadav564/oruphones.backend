const express = require("express");
const router = express.Router();

// require("../../src/database/connection");
// // const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
// const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
// const logEvent = require("../../src/middleware/event_logging");
// const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

const getBestDeals = require("../../utils/get_best_deals");
const logEvent = require("../../src/middleware/event_logging");

router.get("/listings/best/nearall", logEvent, async (req, res) => {
  const location = req.query.userLocation;
  const page = req.query.pageNumber;
  // Put keys always in lower case when get data from headers
  const userUniqueId = req.headers.useruniqueid;

  try {
    let defaultDataObject = [];
    if (location === "India") {
      // defaultDataObject = await bestDealHomeModel.find(
      let defaultDataObject2 = await saveListingModal.find({
        status: "Active",
      }).skip( parseInt(page) * 20).limit(20);
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      const thirdPartyVendors = await getThirdPartyVendors("", "", page);
      thirdPartyVendors.forEach((thirdPartyVendor) => {
        defaultDataObject.push(thirdPartyVendor);
      });
    } else {
      // defaultDataObject = await bestDealHomeModel.find({
      let defaultDataObject2 = await saveListingModal.find({
        listingLocation: location,
        status: "Active",
      }).skip( parseInt(page) * 20).limit(20);
      const thirdPartyVendors = await getThirdPartyVendors("", "", page);
      thirdPartyVendors.forEach((thirdPartyVendor) => {
        defaultDataObject2.push(thirdPartyVendor);
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
        const thirdPartyVendors = await getThirdPartyVendors("", "", page);
        thirdPartyVendors.forEach((thirdPartyVendor) => {
          defaultDataObject.push(thirdPartyVendor);
        });
      }
    }

    getBestDeals(defaultDataObject, userUniqueId, res, false);
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
