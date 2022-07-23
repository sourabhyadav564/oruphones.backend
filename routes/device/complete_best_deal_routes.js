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
  let page = req.query.pageNumber;
  page = parseInt(page.toString());
  // Put keys always in lower case when get data from headers
  const userUniqueId = req.headers.useruniqueid;

  try {
    let defaultDataObject = [];
    let totalProducts;
    if (location === "India") {
      // defaultDataObject = await bestDealHomeModel.find(
      let saveListingLength = await saveListingModal
        .find({
          status: "Active",
        })
        .countDocuments();
      let defaultDataObject2 = await saveListingModal
        .find({
          status: "Active",
        })
        // .skip(parseInt(page) * 20)
        // .limit(20);
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      const thirdPartyVendors = await getThirdPartyVendors("", "", page);
      thirdPartyVendors?.dataArray?.forEach((thirdPartyVendor) => {
        defaultDataObject.push(thirdPartyVendor);
      });
      totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
    } else {
      // defaultDataObject = await bestDealHomeModel.find({
      let saveListingLength = await saveListingModal
        .find({
          listingLocation: location,
          status: "Active",
        })
        .countDocuments();
      let defaultDataObject2 = await saveListingModal
        .find({
          listingLocation: location,
          status: "Active",
        })
        // .skip(parseInt(page) * 20)
        // .limit(20);
      const thirdPartyVendors = await getThirdPartyVendors("", "", page);
      thirdPartyVendors?.dataArray?.forEach((thirdPartyVendor) => {
        defaultDataObject2.push(thirdPartyVendor);
      });
      totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
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
        defaultDataObject.push(...defaultDataObject2);
        // defaultDataObject2.forEach((element) => {
        //   defaultDataObject.push(element);
        // });
        // const thirdPartyVendors = await getThirdPartyVendors("", "", page);
        // thirdPartyVendors?.dataArray?.forEach((thirdPartyVendor) => {
        //   defaultDataObject.push(thirdPartyVendor);
        // });
        // totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
      }
    }

    getBestDeals(defaultDataObject, userUniqueId, res, false, totalProducts);
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
