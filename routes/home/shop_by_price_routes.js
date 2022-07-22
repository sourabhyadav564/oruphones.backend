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

router.get("/shopbyprice/listmodel", logEvent, async (req, res) => {
  const startPrice = req.query.start;
  const endPrice = req.query.end;
  const location = req.query.listingLocation;
  const userUniqueId = req.query.userUniqueId;

  const page = req.query.pageNumber;

  try {
    let defaultDataObject = [];
    if (location === "India") {
      let defaultDataObject2 = [];
      //  if (category === "Fifteen") {
      defaultDataObject2 = await saveListingModal.find({
        $expr: {
          $lte: [
            {
              $toInt: "$listingPrice",
            },
            parseInt(endPrice.toString()),
          ],
        },
        status: "Active",
      }).skip( parseInt(page) * 20).limit(20);
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
      defaultDataObject = await saveListingModal.find({
        listingLocation: location,
        status: "Active",
      }).skip( parseInt(page) * 20).limit(20);

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
        defaultDataObject = await saveListingModal.find({
          $expr: {
            $lte: [
              {
                $toInt: "$listingPrice",
              },
              parseInt(endPrice.toString()),
            ],
          },
          status: "Active",
        }).skip( parseInt(page) * 20).limit(20);
        let defaultDataObject3 = defaultDataObject.filter((item, index) => {
          return (
            parseInt(item.listingPrice.toString()) >=
            parseInt(startPrice.toString())
          );
        });
        defaultDataObject = defaultDataObject3;
      }
    }

    getBestDeals(defaultDataObject, userUniqueId, res, true);
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
