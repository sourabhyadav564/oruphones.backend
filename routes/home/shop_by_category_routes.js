const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
// const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const validUser = require("../../src/middleware/valid_user");
const {
  bestDealsForShopByCategory,
} = require("../../utils/best_deals_helper_routes");
const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/listings/category", validUser, logEvent, async (req, res) => {
  const location = req.query.location;
  const category = req.query.category;
  const userUniqueId = req.query.userUniqueId;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined || sortBy == "Featured") {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  try {
    let defaultDataObject = [];
    let totalProducts;
    if (location === "India") {
      let defaultDataObject2 = [];
      if (category == "verified") {
        categoryHandle(
          {
            verified: true,
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     verified: true,
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     verified: true,
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();

        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "warranty") {
        categoryHandle(
          {
            warranty: [
              "More than 9 months",
              "More than 6 months",
              "More than 3 months",
            ],
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     warranty: [
        //       "More than 9 months",
        //       "More than 6 months",
        //       "More than 3 months",
        //     ],
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     warranty: [
        //       "More than 9 months",
        //       "More than 6 months",
        //       "More than 3 months",
        //     ],
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();

        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "storage") {
        categoryHandle(
          {
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "like new") {
        console.log("like new");
        categoryHandle(
          {
            deviceCondition: "Like New",
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     deviceCondition: "Like New",
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     deviceCondition: "Like New",
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();

        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "excellent") {
        categoryHandle(
          {
            deviceCondition: "Excellent",
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     deviceCondition: "Excellent",
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     deviceCondition: "Excellent",
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();

        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "thirty") {
        categoryHandle(
          {
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     $expr: {
        //       $lt: [
        //         {
        //           $toInt: "$listingPrice",
        //         },
        //         30000,
        //       ],
        //     },
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .countDocuments();

        // let bestdealCount = await bestDealsModal
        //   .find({
        //     $expr: {
        //       $lt: [
        //         {
        //           $toInt: "$listingPrice",
        //         },
        //         30000,
        //       ],
        //     },
        //     status: ["Active", "Sold_Out"],
        //   })
        //   .skip(5)
        //   .countDocuments();

        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject2 = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength - bestdealCount;
      } else if (category === "fifteen") {
        categoryHandle(
          {
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: ["Active", "Sold_Out"],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        //   let saveListingLength = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .countDocuments();

        //   let bestdealCount = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //     })
        //     .skip(5)
        //     .countDocuments();
        //   if (sortBy === "Price - High to Low") {
        //     defaultDataObject2 = await bestDealsModal
        //       .find({
        //         $expr: {
        //           $lt: [
        //             {
        //               $toInt: "$listingPrice",
        //             },
        //             15000,
        //           ],
        //         },
        //         status: ["Active", "Sold_Out"],
        //       })
        //       .sort({ listingPrice: -1 })
        //       .collation({ locale: "en_US", numericOrdering: true })
        //       .skip(parseInt(page) * 30)
        //       .limit(30);
        //   } else if (sortBy === "Price - Low to High") {
        //     defaultDataObject2 = await bestDealsModal
        //       .find({
        //         $expr: {
        //           $lt: [
        //             {
        //               $toInt: "$listingPrice",
        //             },
        //             15000,
        //           ],
        //         },
        //         status: ["Active", "Sold_Out"],
        //       })
        //       .sort({ listingPrice: 1 })
        //       .collation({ locale: "en_US", numericOrdering: true })
        //       .skip(parseInt(page) * 30)
        //       .limit(30);
        //   } else if (sortBy === "Newest First") {
        //     defaultDataObject2 = await bestDealsModal
        //       .find({
        //         $expr: {
        //           $lt: [
        //             {
        //               $toInt: "$listingPrice",
        //             },
        //             15000,
        //           ],
        //         },
        //         status: ["Active", "Sold_Out"],
        //       })
        //       .sort({ createdAt: -1 })
        //       .skip(parseInt(page) * 30)
        //       .limit(30);
        //   } else if (sortBy === "Oldest First") {
        //     defaultDataObject2 = await bestDealsModal
        //       .find({
        //         $expr: {
        //           $lt: [
        //             {
        //               $toInt: "$listingPrice",
        //             },
        //             15000,
        //           ],
        //         },
        //         status: ["Active", "Sold_Out"],
        //       })
        //       .sort({ createdAt: 1 })
        //       .skip(parseInt(page) * 30)
        //       .limit(30);
        //   } else {
        //     defaultDataObject2 = await bestDealsModal
        //       .find({
        //         $expr: {
        //           $lt: [
        //             {
        //               $toInt: "$listingPrice",
        //             },
        //             15000,
        //           ],
        //         },
        //         status: ["Active", "Sold_Out"],
        //       })
        //       .skip(parseInt(page) * 30)
        //       .limit(30);
        //   }
        //   totalProducts = saveListingLength - bestdealCount;
      }
      // defaultDataObject2.forEach((element) => {
      //   defaultDataObject.push(element);
      // });
    } else {
      if (category === "verified") {
        categoryHandle(
          {
            verified: true,
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     verified: true,
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       verified: true,
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "warranty") {
        categoryHandle(
          {
            warranty: [
              "More than 9 months",
              "More than 6 months",
              "More than 3 months",
            ],
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     warranty: [
        //       "More than 9 months",
        //       "More than 6 months",
        //       "More than 3 months",
        //     ],
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       warranty: [
        //         "More than 9 months",
        //         "More than 6 months",
        //         "More than 3 months",
        //       ],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "storage") {
        categoryHandle(
          {
            deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceStorage: ["64 GB", "128 GB", "256 GB", "512 GB"],
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "like new") {
        categoryHandle(
          {
            verified: true,
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     verified: true,
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Like New",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "excellent") {
        categoryHandle(
          {
            deviceCondition: "Excellent",
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     deviceCondition: "Excellent",
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       deviceCondition: "Excellent",
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "thirty") {
        categoryHandle(
          {
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                30000,
              ],
            },
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     $expr: {
        //       $lt: [
        //         {
        //           $toInt: "$listingPrice",
        //         },
        //         30000,
        //       ],
        //     },
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           30000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      } else if (category === "fifteen") {
        categoryHandle(
          {
            $expr: {
              $lt: [
                {
                  $toInt: "$listingPrice",
                },
                15000,
              ],
            },
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          },
          sortBy,
          res,
          page,
          userUniqueId
        );
        // let saveListingLength = await bestDealsModal
        //   .find({
        //     $expr: {
        //       $lt: [
        //         {
        //           $toInt: "$listingPrice",
        //         },
        //         15000,
        //       ],
        //     },
        //     status: ["Active", "Sold_Out"],
        //     $or: [{ listingLocation: location }, { listingLocation: "India" }],
        //   })
        //   .countDocuments();
        // if (sortBy === "Price - High to Low") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: -1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Price - Low to High") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ listingPrice: 1 })
        //     .collation({ locale: "en_US", numericOrdering: true })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Newest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: -1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else if (sortBy === "Oldest First") {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .sort({ createdAt: 1 })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // } else {
        //   defaultDataObject = await bestDealsModal
        //     .find({
        //       $expr: {
        //         $lt: [
        //           {
        //             $toInt: "$listingPrice",
        //           },
        //           15000,
        //         ],
        //       },
        //       status: ["Active", "Sold_Out"],
        //       $or: [
        //         { listingLocation: location },
        //         { listingLocation: "India" },
        //       ],
        //     })
        //     .skip(parseInt(page) * 30)
        //     .limit(30);
        // }
        // totalProducts = saveListingLength;
      }
    }

    // bestDealsForShopByCategory(
    //   page,
    //   userUniqueId,
    //   defaultDataObject,
    //   totalProducts,
    //   sortBy,
    //   res
    // );
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

const categoryHandle = async (findingData, sortBy, res, page, userUniqueId) => {
  let defaultDataObject = [];
  let totalProducts;
  let defaultDataObject2 = [];
  let saveListingLength = await bestDealsModal
    .find(findingData)
    .countDocuments();

  let bestdealCount = await bestDealsModal.find(findingData).countDocuments();

  if (sortBy === "Price - High to Low") {
    defaultDataObject2 = await bestDealsModal
      .find(findingData)
      .sort({ listingPrice: -1 })
      .collation({ locale: "en_US", numericOrdering: true })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Price - Low to High") {
    defaultDataObject2 = await bestDealsModal
      .find(findingData)
      .sort({ listingPrice: 1 })
      .collation({ locale: "en_US", numericOrdering: true })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Newest First") {
    defaultDataObject2 = await bestDealsModal
      .find(findingData)
      .sort({ createdAt: -1 })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else if (sortBy === "Oldest First") {
    defaultDataObject2 = await bestDealsModal
      .find(findingData)
      .sort({ createdAt: 1 })
      .skip(parseInt(page) * 30)
      .limit(30);
  } else {
    defaultDataObject2 = await bestDealsModal
      .find(findingData)
      .skip(parseInt(page) * 30)
      .limit(30);
  }
  totalProducts = saveListingLength - (bestdealCount > 5 ? 5 : bestdealCount);

  defaultDataObject2.forEach((element) => {
    defaultDataObject.push(element);
  });

  bestDealsForShopByCategory(
    page,
    userUniqueId,
    defaultDataObject,
    totalProducts,
    sortBy,
    res
  );
};

module.exports = router;
