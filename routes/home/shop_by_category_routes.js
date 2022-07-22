const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
// const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/listings/category", logEvent, async (req, res) => {
  const location = req.query.location;
  const category = req.query.category;
  const userUniqueId = req.query.userUniqueId;
  const page = req.query.pageNumber;

  try {
    

    let defaultDataObject = [];
    if (location === "India") {
      let defaultDataObject2 = [];
      if (category == "Verified") {
        defaultDataObject2 = await saveListingModal.find({
          verified: true,
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Storage") {
        defaultDataObject2 = await saveListingModal.find({
          deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Like New") {
        defaultDataObject2 = await saveListingModal.find({
          deviceCondition: "Like New",
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Excellent") {
        defaultDataObject2 = await saveListingModal.find({
          deviceCondition: "Excellent",
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Thirty") {
        defaultDataObject2 = await saveListingModal.find({
          $expr: {
            $lt: [
              {
                $toInt: "$listingPrice",
              },
              30000,
            ],
          }, status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Fifteen") {
        defaultDataObject2 = await saveListingModal.find({
          $expr: {
            $lt: [
              {
                $toInt: "$listingPrice",
              },
              15000,
            ],
          }, status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      }
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      // const thirdPartyVendors = await getThirdPartyVendors("", "");
      // thirdPartyVendors.forEach((thirdPartyVendor) => {
      //   defaultDataObject.push(thirdPartyVendor);
      // });
    } else {
      // defaultDataObject = await saveListingModal.find({
      //   listingLocation: location,
      // });
      if (category === "Verified") {
        defaultDataObject = await saveListingModal.find({ verified: true, status: "Active" }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Storage") {
        defaultDataObject = await saveListingModal.find({
          deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Like New") {
        defaultDataObject = await saveListingModal.find({
          deviceCondition: "Like New",
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Excellent") {
        defaultDataObject = await saveListingModal.find({
          deviceCondition: "Excellent",
          status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Thirty") {
        defaultDataObject = await saveListingModal.find({
          $expr: {
            $lt: [
              {
                $toInt: "$listingPrice",
              },
              30000,
            ],
          }, status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      } else if (category === "Fifteen") {
        defaultDataObject = await saveListingModal.find({
          $expr: {
            $lt: [
              {
                $toInt: "$listingPrice",
              },
              15000,
            ],
          }, status: "Active"
        }).skip( parseInt(page) * 20).limit(20);
      }
    }

    getBestDeals(defaultDataObject, userUniqueId, res, false);

    
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
