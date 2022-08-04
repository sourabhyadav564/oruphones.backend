const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
// const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const {
  bestDealsForShopByCategory,
} = require("../../utils/best_deals_helper_routes");
const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/listings/category", logEvent, async (req, res) => {
  const location = req.query.location;
  const category = req.query.category;
  const userUniqueId = req.query.userUniqueId;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  try {
    let defaultDataObject = [];
    let totalProducts;
    if (location === "India") {
      let defaultDataObject2 = [];
      if (category == "Verified") {
        let saveListingLength = await bestDealsModal
          .find({
            verified: true,
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            verified: true,
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "Storage") {
        let saveListingLength = await bestDealsModal
          .find({
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "Like New") {
        let saveListingLength = await bestDealsModal
          .find({
            deviceCondition: "Like New",
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            deviceCondition: "Like New",
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "Excellent") {
        let saveListingLength = await bestDealsModal
          .find({
            deviceCondition: "Excellent",
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            deviceCondition: "Excellent",
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "Thirty") {
        let saveListingLength = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "Fifteen") {
        let saveListingLength = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: "Active",
          })
          .countDocuments();
        defaultDataObject2 = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: "Active",
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
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
      if (category === "verified") {
        let saveListingLength = await bestDealsModal
          .find({
            verified: true,
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            verified: true,
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "warranty") {
        let saveListingLength = await bestDealsModal
          .find({
            warranty: [
              "More than 9 months",
              "More than 6 months",
              "More than 3 months",
            ],
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            warranty: [
              "More than 9 months",
              "More than 6 months",
              "More than 3 months",
            ],
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "storage") {
        let saveListingLength = await bestDealsModal
          .find({
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "like new") {
        let saveListingLength = await bestDealsModal
          .find({
            verified: true,
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            deviceCondition: "Like New",
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "excellent") {
        let saveListingLength = await bestDealsModal
          .find({
            deviceCondition: "Excellent",
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            deviceCondition: "Excellent",
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "thirty") {
        let saveListingLength = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      } else if (category === "fifteen") {
        let saveListingLength = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        totalProducts = saveListingLength;
      }
    }

    bestDealsForShopByCategory(
      page,
      userUniqueId,
      defaultDataObject,
      totalProducts,
      res
    );
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
