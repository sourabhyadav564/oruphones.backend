const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const saveListingModal = require("../../src/database/modals/device/save_listing_device");
// const getThirdPartyVendors = require("../../utils/third_party_listings");
// const getRecommendedPrice = require("../../utils/get_recommended_price");
// const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
// const getBestDeals = require("../../utils/get_best_deals");
const logEvent = require("../../src/middleware/event_logging");
// const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
const {
  bestDealsForSearchListing,
} = require("../../utils/best_deals_helper_routes");
const validUser = require("../../src/middleware/valid_user");

router.post("/listings/search", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.query.userUniqueId;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceStorage = req.body.deviceStorage;
  const deviceRam = req.body.deviceRam;
  let make = req.body.make;
  const listingLocation = req.body.listingLocation;
  const maxsellingPrice = req.body.maxsellingPrice;
  const minsellingPrice = req.body.minsellingPrice;
  const reqPage = req.body.reqPage;
  const verified = req.body.verified === "verified" ? true : false;
  const warenty = req.body.warenty;
  const marketingName = req.body.marketingName;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  try {
    let sortBy = req.query.sortBy;
    let sorting = {};
    if (!sortBy) {
      sortBy = "NA";
    }
    if (sortBy == undefined || sortBy == "Featured" || sortBy == "undefined") {
      sortBy = "NA";
    } else {
      sortBy = sortBy;
      if (sortBy == "Price - Low to High") {
        sorting = { listingPrice: 1 };
      } else if (sortBy == "Price - High to Low") {
        sorting = { listingPrice: -1 };
      } else if (sortBy == "Newest First") {
        sorting = { createdAt: -1 };
      } else if (sortBy == "Oldest First") {
        sorting = { createdAt: 1 };
      }
    }

    let findingData = {
      status: ["Active", "Sold_Out"],
    };
    // create findindData object
    if (marketingName && marketingName.length > 0) {
      findingData.marketingName = marketingName;
    } else if (make && make.length > 0) {
      findingData.make = make;
    }

    if (deviceStorage.length > 0) {
      findingData.deviceStorage = deviceStorage;
    }
    if (deviceRam.length > 0) {
      findingData.deviceRam = deviceRam;
    }
    if (deviceCondition.length > 0 && reqPage !== "TSM") {
      findingData.deviceCondition = deviceCondition;
    }
    if (listingLocation != "India") {
      findingData.listingLocation = [listingLocation, "India"];
    }
    if (parseInt(maxsellingPrice) > parseInt(minsellingPrice)) {
      let expression = {
        $expr: {
          $and: [
            {
              $gte: [
                {
                  $toInt: "$listingPrice",
                },
                parseInt(minsellingPrice),
              ],
            },
            {
              $lte: [
                {
                  $toInt: "$listingPrice",
                },
                parseInt(maxsellingPrice),
              ],
            },
          ],
        },
      };
      findingData = { ...findingData, ...expression };
    }

    if (verified == true) {
      findingData.verified = true;
    }

    if (warenty.length > 0 && reqPage !== "TSM") {
      if (warenty.length > 1) {
        // findingData["$expr"] = {
        let expression = {
          $expr: {
            $and: [
              { $ne: ["$warranty", "No"] },
              { $ne: ["$warranty", "None"] },
            ],
          },
        };
        findingData = { ...findingData, ...expression };
      } else {
        if (warenty.includes("Seller Warranty")) {
          // findingData[`${$expr}`] = {
          let expression = {
            $expr: {
              $and: [
                { $ne: ["$warranty", "More than 3 months"] },
                { $ne: ["$warranty", "More than 6 months"] },
                { $ne: ["$warranty", "More than 9 months"] },
                { $ne: ["$warranty", "None"] },
                { $ne: ["$warranty", null] },
              ],
            },
          };
          findingData = { ...findingData, ...expression };
        } else if (warenty.includes("Brand Warranty")) {
          // findingData[`${$expr}`] = {
          let expression = {
            $expr: {
              $and: [
                {
                  $or: [
                    { $eq: ["$warranty", "More than 3 months"] },
                    { $eq: ["$warranty", "More than 6 months"] },
                    { $eq: ["$warranty", "More than 9 months"] },
                  ],
                },
                { $ne: ["$warranty", "None"] },
              ],
            },
          };
          findingData = { ...findingData, ...expression };
        }
      }
    }

    // let allListings = [];
    // // let listing = [];
    // let totalProducts;
    // allListings = await bestDealsModal
    //   .find(findingData, { _id: 0 })
    //   .sort(sorting);

    bestDealsForSearchListing(
      listingLocation,
      page,
      userUniqueId,
      // allListings,
      // totalProducts,
      res,
      findingData,
      sortBy
    );

    // Not to do anything below***************************************************

    // console.log("findingData", findingData);

    // if (marketingName && marketingName.length > 0) {
    //   // let saveListingLength = await bestDealsModal
    //   //   .find({ marketingName: marketingName[0], status: ["Active", "Sold_Out"] }, { _id: 0 })
    //   //   .countDocuments();
    //   let ourListing = await bestDealsModal
    //     .find(
    //       { marketingName: marketingName[0], status: ["Active", "Sold_Out"] },
    //       { _id: 0 }
    //     )
    //     .sort(sorting);
    //   // .skip(parseInt(page) * 20)
    //   // .limit(20);
    //   listing.push(...ourListing);
    // } else if (make.length > 0) {
    //   // let saveListingLength = await bestDealsModal
    //   //   .find({ make: make, status: ["Active", "Sold_Out"] }, { _id: 0 })
    //   //   .countDocuments();
    //   let ourListing = await bestDealsModal
    //     .find({ make: make, status: ["Active", "Sold_Out"] }, { _id: 0 })
    //     .sort(sorting);
    //   // .skip(parseInt(page) * 20)
    //   // .limit(20);
    //   listing.push(...ourListing);
    // } else {
    //   // let saveListingLength = await bestDealsModal
    //   //   .find({ status: ["Active", "Sold_Out"] }, { _id: 0 })
    //   //   .countDocuments();
    //   let ourListing = await bestDealsModal
    //     .find({ status: ["Active", "Sold_Out"] }, { _id: 0 })
    //     .sort(sorting);
    //   // .skip(parseInt(page) * 20)
    //   // .limit(20);
    //   listing.push(...ourListing);
    // }

    // allListings = listing;

    // if (make.length > 0) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return make.includes(item.make);
    //   });
    //   allListings = tempListings;
    // }

    // if (color.length > 0 && reqPage !== "TSM") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return color.includes(item.color);
    //   });
    //   allListings = tempListings;
    // }

    // if (deviceStorage.length > 0) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return deviceStorage.includes(item.deviceStorage);
    //   });
    //   allListings = tempListings;
    // }

    // if (deviceRam.length > 0) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return deviceRam.includes(item.deviceRam);
    //   });
    //   allListings = tempListings;
    // }

    // if (deviceCondition.length > 0 && reqPage !== "TSM") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return deviceCondition.includes(item.deviceCondition);
    //   });
    //   allListings = tempListings;
    // }

    // if (listingLocation != "India") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return (
    //       item.listingLocation === listingLocation ||
    //       item.listingLocation === "India"
    //     );
    //   });
    //   allListings = tempListings;
    // }

    // if (parseInt(maxsellingPrice) > parseInt(minsellingPrice)) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return parseInt(item.listingPrice) <= parseInt(maxsellingPrice);
    //   });
    //   allListings = tempListings;
    // }

    // if (parseInt(minsellingPrice) < parseInt(maxsellingPrice)) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return parseInt(item.listingPrice) >= parseInt(minsellingPrice);
    //   });
    //   allListings = tempListings;
    // }

    // if (warenty != "") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return item.warenty === warenty;
    //   });
    //   allListings = tempListings;
    // }

    // if (warenty.length > 0 && reqPage !== "TSM") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     if (
    //       warenty.includes("Brand Warranty") &&
    //       warenty.includes("Seller Warranty")
    //     ) {
    //       return item.warranty != "None";
    //     } else if (warenty.includes("Brand Warranty")) {
    //       if (item.warranty != "None" && item.isOtherVendor === "N") {
    //         // console.log("Warranty", item);
    //         // warranty: 'None';
    //         return item;
    //       }
    //     } else if (warenty.includes("Seller Warranty")) {
    //       // console.log("Seller Warranty", item.warranty);
    //       return item.isOtherVendor === "Y";
    //     } else {
    //       return item.warranty != "None";
    //     }
    //   });
    //   allListings = tempListings;
    // }

    // if (verified === true) {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     if (item.verified === true) {
    //       return item;
    //     }
    //   });
    //   allListings = tempListings;
    // }

    // totalProducts = allListings.length;

    // let location = listingLocation;

    // bestDealsForSearchListing(
    //   listingLocation,
    //   page,
    //   userUniqueId,
    //   // allListings,
    //   // totalProducts,
    //   res,
    //   findingData
    // );
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
