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
  bestDealsForShopByPrice,
} = require("../../utils/best_deals_helper_routes");
const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/shopbyprice/listmodel", validUser, logEvent, async (req, res) => {
  const startPrice = req.query.start;
  const endPrice = req.query.end;
  const location = req.query.listingLocation;
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

    let bestDeals = [];
    let bestDealsCount = [];

    if (location === "India") {
      let defaultDataObject2 = [];

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
          status: ["Active", "Sold_Out"],
        })
        .countDocuments();

      if (sortBy === "Price - High to Low") {
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
            status: ["Active", "Sold_Out"],
          })
          .sort({ listingPrice: -1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "Price - Low to High") {
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
            status: ["Active", "Sold_Out"],
          })
          .sort({ listingPrice: 1 })
          .collation({ locale: "en_US", numericOrdering: true })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "Newest First") {
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
            status: ["Active", "Sold_Out"],
          })
          .sort({ createdAt: -1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else if (sortBy === "Oldest First") {
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
            status: ["Active", "Sold_Out"],
          })
          .sort({ createdAt: 1 })
          .skip(parseInt(page) * 30)
          .limit(30);
      } else {
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
            status: ["Active", "Sold_Out"],
          })
          .skip(parseInt(page) * 30)
          .limit(30);
      }
      totalProducts = saveListingLength;
      let defaultDataObject3 = defaultDataObject2.filter((item, index) => {
        return (
          parseInt(item.listingPrice.toString()) >=
          parseInt(startPrice.toString())
        );
      });
      defaultDataObject2 = defaultDataObject3;
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
    } else {
      let saveListingLength = await bestDealsModal
        .find({
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          status: ["Active", "Sold_Out"],
        })
        .countDocuments();
        if (sortBy === "Price - High to Low") {
          defaultDataObject = await bestDealsModal
            .find({
              $or: [{ listingLocation: location }, { listingLocation: "India" }],
              status: ["Active", "Sold_Out"],
            })
            .sort({ listingPrice: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (sortBy === "Price - Low to High") {
          defaultDataObject = await bestDealsModal
            .find({
              $or: [{ listingLocation: location }, { listingLocation: "India" }],
              status: ["Active", "Sold_Out"],
            })
            .sort({ listingPrice: 1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (sortBy === "Newest First") {
          defaultDataObject = await bestDealsModal
            .find({
              $or: [{ listingLocation: location }, { listingLocation: "India" }],
              status: ["Active", "Sold_Out"],
            })
            .sort({ createdAt: -1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else if (sortBy === "Oldest First") {
          defaultDataObject = await bestDealsModal
            .find({
              $or: [{ listingLocation: location }, { listingLocation: "India" }],
              status: ["Active", "Sold_Out"],
            })
            .sort({ createdAt: 1 })
            .skip(parseInt(page) * 30)
            .limit(30);
        } else {
          defaultDataObject = await bestDealsModal
          .find({
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
            status: ["Active", "Sold_Out"],
          })
          .skip(parseInt(page) * 30)
          .limit(30);
        }
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
            status: ["Active", "Sold_Out"],
            $or: [{ listingLocation: location }, { listingLocation: "India" }],
          })
          .countDocuments();
          if (sortBy === "Price - High to Low") {
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
                status: ["Active", "Sold_Out"],
                $or: [{ listingLocation: location }, { listingLocation: "India" }],
              })
              .sort({ listingPrice: -1 })
              .collation({ locale: "en_US", numericOrdering: true })
              .skip(parseInt(page) * 30)
              .limit(30);
          } else if (sortBy === "Price - Low to High") {
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
                status: ["Active", "Sold_Out"],
                $or: [{ listingLocation: location }, { listingLocation: "India" }],
              })
              .sort({ listingPrice: 1 })
              .collation({ locale: "en_US", numericOrdering: true })
              .skip(parseInt(page) * 30)
              .limit(30);
          } else if (sortBy === "Newest First") {
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
                status: ["Active", "Sold_Out"],
                $or: [{ listingLocation: location }, { listingLocation: "India" }],
              })
              .sort({ createdAt: -1 })
              .skip(parseInt(page) * 30)
              .limit(30);
          } else if (sortBy === "Oldest First") {
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
                status: ["Active", "Sold_Out"],
                $or: [{ listingLocation: location }, { listingLocation: "India" }],
              })
              .sort({ createdAt: 1 })
              .skip(parseInt(page) * 30)
              .limit(30);
          } else {
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
                status: ["Active", "Sold_Out"],
                $or: [{ listingLocation: location }, { listingLocation: "India" }],
              })
              .skip(parseInt(page) * 30)
              .limit(30);
          }
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

    bestDealsForShopByPrice(
      page,
      userUniqueId,
      defaultDataObject,
      totalProducts,
      sortBy,
      res
    );
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router;
