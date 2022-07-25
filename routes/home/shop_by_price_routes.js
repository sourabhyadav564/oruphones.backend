const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
// const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const bestDealsForShopByPrice = require("../../utils/best_deals_helper_routes");
const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/shopbyprice/listmodel", logEvent, async (req, res) => {
  const startPrice = req.query.start;
  const endPrice = req.query.end;
  const location = req.query.listingLocation;
  const userUniqueId = req.query.userUniqueId;

  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  try {
    let defaultDataObject = [];
    let totalProducts;
    if (location === "India") {
      let defaultDataObject2 = [];
      //  if (category === "Fifteen") {

      let saveListingLength = await bestDealsModal
        .find({
          $expr: {
            $and: [
              { $ne: ["$listingPrice", "--"] },
              {
                $lte: [
                  {
                    $toInt: "$listingPrice",
                  },
                  parseInt(endPrice.toString()),
                ],
              },
            ],
          },
          status: "Active",
        })
        .countDocuments();
      defaultDataObject2 = await bestDealsModal
        .find({
          $expr: {
            $and: [
              { $ne: ["$listingPrice", "--"] },
              {
                $lte: [
                  {
                    $toInt: "$listingPrice",
                  },
                  parseInt(endPrice.toString()),
                ],
              },
            ],
          },
          status: "Active",
        })
        .skip(parseInt(page) * 20)
        .limit(20);
      totalProducts = saveListingLength;
      let defaultDataObject3 = defaultDataObject2.filter((item, index) => {
        return (
          parseInt(item.listingPrice.toString()) >=
          parseInt(startPrice.toString())
        );
      });
      defaultDataObject2 = defaultDataObject3;
      //   }
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      //   const thirdPartyVendors = await getThirdPartyVendors("", "");
      //   thirdPartyVendors.forEach((thirdPartyVendor) => {
      //     defaultDataObject.push(thirdPartyVendor);
      //   });
    } else {
      let saveListingLength = await bestDealsModal
        .find({
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          status: "Active",
        })
        .countDocuments();
      defaultDataObject = await bestDealsModal
        .find({
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          status: "Active",
        })
        .skip(parseInt(page) * 20)
        .limit(20);
      totalProducts = saveListingLength;

      if (!defaultDataObject.length) {
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
        let saveListingLength = await bestDealsModal
          .find({
            $expr: {
              $and: [
                { $ne: ["$listingPrice", "--"] },
                {
                  $lte: [
                    {
                      $toInt: "$listingPrice",
                    },
                    parseInt(endPrice.toString()),
                  ],
                },
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
        defaultDataObject = await bestDealsModal
          .find({
            $expr: {
              $and: [
                { $ne: ["$listingPrice", "--"] },
                {
                  $lte: [
                    {
                      $toInt: "$listingPrice",
                    },
                    parseInt(endPrice.toString()),
                  ],
                },
              ],
            },
            status: "Active",
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .skip(parseInt(page) * 20)
          .limit(20);
        let defaultDataObject3 = defaultDataObject.filter((item, index) => {
          return (
            parseInt(item.listingPrice.toString()) >=
            parseInt(startPrice.toString())
          );
        });
        totalProducts = saveListingLength;
        defaultDataObject = defaultDataObject3;
      }
    }

    // getBestDeals(defaultDataObject, userUniqueId, res, true, totalProducts);
    bestDealsForShopByPrice(
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
