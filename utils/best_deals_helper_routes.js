// const getBestDeals = require("./get_best_deals");
const bestDealsModal = require("../src/database/modals/others/best_deals_models");
const favoriteModal = require("../src/database/modals/favorite/favorite_add");
// const saveListingModal = require("../src/database/modals/device/save_listing_device");
const applySortFilter = require("./sort_filter");
const { async } = require("@firebase/util");
const { neededKeysForDeals } = require("./matrix_figures");

const commonFunc = async (
  location,
  term,
  page,
  userUniqueId,
  sortBy,
  res,
  type
) => {
  let updatedBestDeals = [];
  let otherListings = [];

  let favList = [];
  if (userUniqueId !== "Guest") {
    // const getFavObject = await favoriteModal.findOne({
    //   userUniqueId: userUniqueId,
    // });

    let getFavObject = await favoriteModal.aggregate([
      {
        $match: {
          userUniqueId: userUniqueId,
        },
      },
      {
        $project: {
          _id: 0,
          fav_listings: 1,
        },
      },
    ]);

    if (getFavObject && getFavObject.length > 0 && getFavObject[0].length > 0) {
      favList = getFavObject[0].fav_listings;
    } else {
      favList = [];
    }
  }

  let findingData = {};
  if (type == "category") {
    switch (term) {
      case "verified":
        findingData = {
          verified: true,
          status: ["Active", "Sold_Out"],
        };
        break;
      case "warranty":
        findingData = {
          $expr: {
            $and: [
              { $ne: ["$warranty", "No"] },
              { $ne: ["$warranty", "None"] },
              { $ne: ["$warranty", null] },
              // { $nin: ["$warranty", ["None", "No"]] },
              // { "$not": { "$in": ["$warranty", ["None", "No"]] }}
            ],
          },
          status: ["Active", "Sold_Out"],
        };
        break;
      case "brandWarranty":
        findingData = {
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
              { status: ["Active", "Sold_Out"] },
            ],
          },
        };

        // findingData = {
        //   $expr: {
        //     $and: [
        //       {
        //         warranty: [
        //           "More than 9 months",
        //           "More than 6 months",
        //           "More than 3 months",
        //         ],
        //       },
        //       { status: ["Active", "Sold_Out"] },
        //     ],
        //   },
        // };
        break;
      case "sellerWarranty":
        findingData = {
          $expr: {
            $and: [
              { $ne: ["$warranty", "More than 3 months"] },
              { $ne: ["$warranty", "More than 6 months"] },
              { $ne: ["$warranty", "More than 9 months"] },
              { $ne: ["$warranty", "None"] },
              { $ne: ["$warranty", "No"] },
              { $ne: ["$warranty", null] },
              { status: ["Active", "Sold_Out"] },
            ],
          },
        };
        break;
      case "like new":
        findingData = {
          deviceCondition: "Like New",
          status: ["Active", "Sold_Out"],
        };
        break;
    }
  } else if (type == "price") {
    findingData = {
      // listingPrice: {
      //   $gte: term[0],
      //   $lte: term[1],
      // },
      $expr: {
        $and: [
          {
            $lte: [
              {
                $toInt: "$listingPrice",
              },
              parseInt(term[1].toString()),
            ],
          },
          {
            $gte: [
              {
                $toInt: "$listingPrice",
              },
              parseInt(term[0].toString()),
            ],
          },
        ],
      },
      status: ["Active", "Sold_Out"],
    };
  } else if (type == "make") {
    findingData = {
      make: term,
      status: ["Active", "Sold_Out"],
    };
  } else if (type == "marketingName") {
    findingData = {
      marketingName: term,
      status: ["Active", "Sold_Out"],
    };
  } else if (type == "nearme" || type == "nearall") {
    findingData = {
      status: ["Active", "Sold_Out"],
    };
  } else if (type == "filter") {
    findingData = term;
  }

  // update findingData with location if location is not India
  if (location !== "India") {
    findingData = {
      ...findingData,
      $or: [{ listingLocation: location }, { listingLocation: "India" }],
    };
  }

  const fitlerResults = await applySortFilter(
    sortBy,
    // term,
    page,
    // location,
    findingData
  );

  if (userUniqueId !== "Guest") {
    // add favorite listings to the final list
    fitlerResults.completeDeals.forEach((item, index) => {
      if (favList.includes(item.listingId)) {
        fitlerResults.completeDeals[index].favourite = true;
      } else {
        fitlerResults.completeDeals[index].favourite = false;
      }
    });
  }

  let completeDeals = [];
  // let isFromZero = sortBy === "NA" ? false : true;

  if (type != "nearme") {
    // completeDeals = await bestDealsModal
    //   .find(
    //     {
    //       ...findingData,
    //       notionalPercentage: {
    //         $gt: 0,
    //         $lte: 40,
    //       },
    //     },
    //     neededKeysForDeals
    //   )
    //   .limit(5);

    //  rewrite the above query to get the best deals with faster response time
    completeDeals = await bestDealsModal.aggregate([
      {
        $match: {
          ...findingData,
          notionalPercentage: {
            $gt: 0,
            $lte: 40,
          },
        },
      },
      {
        $project: {
          ...neededKeysForDeals,
          images: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$images" },
                  { $gt: [{ $size: "$images" }, 0] },
                ],
              },
              then: { $arrayElemAt: ["$images", 0] },
              else: "$images",
            },
          },
        },
      },
      {
        $limit: 5,
      },
    ]);
  }

  updatedBestDeals = completeDeals;
  if (page == 0) {
    otherListings = fitlerResults.completeDeals;
    // .slice(
    //   isFromZero ? 0 : 5,
    //   fitlerResults.completeDeals.length
    // );
    updatedBestDeals.forEach((item, index) => {
      otherListings.splice(
        otherListings.findIndex((x) => x.listingId === item.listingId),
        1
      );
    });
  } else {
    otherListings = fitlerResults.completeDeals;
    // updatedBestDeals.forEach((item, index) => {
    //   otherListings.splice(
    //     otherListings.findIndex((x) => x.listingId === item.listingId),
    //     1
    //   );
    // });
    updatedBestDeals = [];
  }

  res.status(200).json({
    reason: "Best deals found",
    statusCode: 200,
    status: "SUCCESS",
    dataObject: {
      bestDeals: updatedBestDeals,
      otherListings: otherListings,
      totalProducts:
        fitlerResults.totalProducts -
        (fitlerResults.bestDealsCount > 5 ? 5 : fitlerResults.bestDealsCount),
    },
  });
};

const sortOtherListings = async (otherListings, sortBy) => {
  switch (sortBy) {
    case "NA":
      otherListings.sort((a, b) => {
        return b.notionalPercentage - a.notionalPercentage;
      });
      break;
    case "Price - High to Low":
      otherListings.sort((a, b) => {
        return b.listingPrice - a.listingPrice;
      });
      // otherListings.sort({ listingPrice: -1 });
      break;
    case "Price - Low to High":
      otherListings.sort((a, b) => {
        return a.listingPrice - b.listingPrice;
      });
      // otherListings.sort({ listingPrice: 1 });
      break;
    case "Newest First":
      otherListings.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
      // otherListings.sort({ createdAt: -1 });
      break;
    case "Oldest First":
      otherListings.sort((a, b) => {
        return a.createdAt - b.createdAt;
      });
      // otherListings.sort({ createdAt: 1 });
      break;
    default:
      otherListings.sort((a, b) => {
        return b.notionalPercentage - a.notionalPercentage;
      });
      break;
  }

  return otherListings;
};

const bestDealsNearMe = async (location, page, userUniqueId, sortBy, res) => {
  try {
    commonFunc(location, "all", page, userUniqueId, sortBy, res, "nearme");
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsNearMe = bestDealsNearMe;

const bestDealsNearAll = async (location, page, userUniqueId, sortBy, res) => {
  try {
    commonFunc(location, "all", page, userUniqueId, sortBy, res, "nearall");
    // let updatedBestDeals = [];
    // let otherListings = [];

    // let favList = [];
    // if (userUniqueId !== "Guest") {
    //   const getFavObject = await favoriteModal.findOne({
    //     userUniqueId: userUniqueId,
    //   });

    //   if (getFavObject) {
    //     favList = getFavObject.fav_listings;
    //   } else {
    //     favList = [];
    //   }
    // }

    // if (location === "India") {
    //   const fitlerResults = await applySortFilter(
    //     sortBy,
    //     "all",
    //     page,
    //     location
    //   );

    //   if (userUniqueId !== "Guest") {
    //     // add favorite listings to the final list
    //     fitlerResults.completeDeals.forEach((item, index) => {
    //       if (favList.includes(item.listingId)) {
    //         fitlerResults.completeDeals[index].favourite = true;
    //       } else {
    //         fitlerResults.completeDeals[index].favourite = false;
    //       }
    //     });
    //   }

    //   let isFromZero = sortBy === "NA" ? false : true;
    //   completeDeals = await bestDealsModal
    //     .find({ status: ["Active", "Sold_Out"] })
    //     .limit(5);

    //   updatedBestDeals = completeDeals;

    //   if (page == 0) {
    //     otherListings = fitlerResults.completeDeals;
    //     // .slice(
    //     //   isFromZero ? 0 : 5,
    //     //   fitlerResults.completeDeals.length
    //     // );
    //     updatedBestDeals.forEach((item, index) => {
    //       otherListings.splice(
    //         otherListings.findIndex((x) => x.listingId === item.listingId),
    //         1
    //       );
    //     });
    //   } else {
    //     otherListings = fitlerResults.completeDeals;
    //     updatedBestDeals.forEach((item, index) => {
    //       otherListings.splice(
    //         otherListings.findIndex((x) => x.listingId === item.listingId),
    //         1
    //       );
    //     });
    //     updatedBestDeals = [];
    //   }

    //   let refineBestDeals = [];

    //   updatedBestDeals.forEach((item, index) => {
    //     console.log("item", item.notionalPercentage);
    //     if (item.notionalPercentage > 0) {
    //       refineBestDeals.push(item);
    //     } else {
    //       otherListings.push(item);
    //     }
    //   });

    //   if (sortBy === "NA") {
    //     otherListings.sort((a, b) => {
    //       return (
    //         b.notionalPercentage - a.notionalPercentage
    //       );
    //     });
    //   }

    //   res.status(200).json({
    //     reason: "Best deals found",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     dataObject: {
    //       bestDeals: refineBestDeals,
    //       otherListings: otherListings,
    //       totalProducts: fitlerResults.totalProducts -
    //         (fitlerResults.bestDealsCount > 5
    //           ? 5
    //           : fitlerResults.bestDealsCount),
    //     },
    //   });
    // } else {
    //   const fitlerResults = await applySortFilter(
    //     sortBy,
    //     "all",
    //     page,
    //     location
    //   );

    //   let isFromZero = sortBy === "NA" ? false : true;
    //   completeDeals = await bestDealsModal
    //     .find({
    //       status: ["Active", "Sold_Out"],
    //       $or: [{ listingLocation: location }, { listingLocation: "India" }],
    //     })
    //     .limit(5);

    //   updatedBestDeals = completeDeals;

    //   if (page == 0) {
    //     otherListings = fitlerResults.completeDeals;
    //     // .slice(
    //     //   isFromZero ? 0 : 5,
    //     //   fitlerResults.completeDeals.length
    //     // );
    //     updatedBestDeals.forEach((item, index) => {
    //       otherListings.splice(
    //         otherListings.findIndex((x) => x.listingId === item.listingId),
    //         1
    //       );
    //     });
    //   } else {
    //     otherListings = fitlerResults.completeDeals;
    //     updatedBestDeals.forEach((item, index) => {
    //       otherListings.splice(
    //         otherListings.findIndex((x) => x.listingId === item.listingId),
    //         1
    //       );
    //     });
    //     updatedBestDeals = [];
    //   }

    //   let refineBestDeals = [];

    //   updatedBestDeals.forEach((item, index) => {
    //     console.log("item", item.notionalPercentage);
    //     if (item.notionalPercentage > 0) {
    //       refineBestDeals.push(item);
    //     } else {
    //       otherListings.push(item);
    //     }
    //   });

    //   if (sortBy === "NA") {
    //     otherListings.sort((a, b) => {
    //       return (
    //         b.notionalPercentage - a.notionalPercentage
    //       );
    //     });
    //   }

    //   res.status(200).json({
    //     reason: "Best deals found",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     dataObject: {
    //       bestDeals: refineBestDeals,
    //       otherListings: otherListings,
    //       totalProducts: fitlerResults.totalProducts -
    //         (fitlerResults.bestDealsCount > 5
    //           ? 5
    //           : fitlerResults.bestDealsCount),
    //     },
    //   });
    // }
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsNearAll = bestDealsNearAll;

const bestDealsByMake = async (
  location,
  make,
  page,
  userUniqueId,
  sortBy,
  res
) => {
  try {
    commonFunc(location, make, page, userUniqueId, sortBy, res, "make");
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsByMake = bestDealsByMake;

const bestDealsByMarketingName = async (
  location,
  marketingName,
  page,
  userUniqueId,
  sortBy,
  res
) => {
  try {
    commonFunc(
      location,
      marketingName,
      page,
      userUniqueId,
      sortBy,
      res,
      "marketingName"
    );
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsByMarketingName = bestDealsByMarketingName;

const bestDealsForSearchListing = async (
  location,
  page,
  userUniqueId,
  // deals,
  // totalProducts,
  res,
  findData,
  sortBy
) => {
  try {
    commonFunc(location, findData, page, userUniqueId, sortBy, res, "filter");
    // let updatedBestDeals = [];
    // let otherListings = [];

    // let favList = [];
    // if (userUniqueId !== "Guest") {
    //   const getFavObject = await favoriteModal.findOne({
    //     userUniqueId: userUniqueId,
    //   });

    //   if (getFavObject) {
    //     favList = getFavObject.fav_listings;
    //   } else {
    //     favList = [];
    //   }
    // }

    // if (location === "India") {
    //   if (userUniqueId !== "Guest") {
    //     deals.forEach((item, index) => {
    //       if (favList.includes(item.listingId)) {
    //         deals[index].favourite = true;
    //       } else {
    //         deals[index].favourite = false;
    //       }
    //     });
    //   }

    //   if (page == 0) {
    //     updatedBestDeals = deals.slice(0, 5);
    //     otherListings = deals.slice(5, deals.length);
    //   } else {
    //     otherListings = deals;
    //   }
    //   res.status(200).json({
    //     reason: "Best deals found",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     dataObject: {
    //       bestDeals: updatedBestDeals,
    //       otherListings: otherListings,
    //       totalProducts: totalProducts,
    //     },
    //   });
    // } else {
    //   if (userUniqueId !== "Guest") {
    //     deals.forEach((item, index) => {
    //       if (favList.includes(item.listingId)) {
    //         deals[index].favourite = true;
    //       } else {
    //         deals[index].favourite = false;
    //       }
    //     });
    //   }

    //   // let getSavedDeals = await saveListingModal.find({
    //   //   status: ["Active", "Sold_Out"],
    //   //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
    //   // });

    //   // deals = deals.concat(getSavedDeals);

    //   if (page == 0) {
    //     updatedBestDeals = deals.slice(0, 5);
    //     otherListings = deals.slice(5, deals.length);
    //   } else {
    //     otherListings = deals;
    //   }
    //   res.status(200).json({
    //     reason: "Best deals found",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     dataObject: {
    //       bestDeals: updatedBestDeals,
    //       otherListings: otherListings,
    //       totalProducts: totalProducts - updatedBestDeals.length,
    //     },
    //   });
    // }
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForSearchListing = bestDealsForSearchListing;

const bestDealsForShopByCategory = async (
  page,
  userUniqueId,
  // deals,
  // totalProducts,
  sortBy,
  res,
  location,
  category
) => {
  try {
    commonFunc(location, category, page, userUniqueId, sortBy, res, "category");
    // let updatedBestDeals = [];
    // let otherListings = [];

    // let favList = [];
    // if (userUniqueId !== "Guest") {
    //   const getFavObject = await favoriteModal.findOne({
    //     userUniqueId: userUniqueId,
    //   });

    //   if (getFavObject) {
    //     favList = getFavObject.fav_listings;
    //   } else {
    //     favList = [];
    //   }
    // }

    // if (userUniqueId !== "Guest") {
    //   deals.forEach((item, index) => {
    //     if (favList.includes(item.listingId)) {
    //       deals[index].favourite = true;
    //     } else {
    //       deals[index].favourite = false;
    //     }
    //   });
    // }

    // if (page == 0) {
    //   updatedBestDeals = deals.slice(0, 5);
    //   otherListings = deals.slice(5, deals.length);
    // } else {
    //   otherListings = deals;
    // }

    // let refineBestDeals = [];

    // updatedBestDeals.forEach((item, index) => {
    //   console.log("item", item.notionalPercentage);
    //   if (item.notionalPercentage > 0) {
    //     refineBestDeals.push(item);
    //   } else {
    //     otherListings.push(item);
    //   }
    // });

    // // otherListings.sort((a, b) => {
    // //   return (
    // //     b.notionalPercentage - a.notionalPercentage
    // //   );
    // // });
    // console.log("sortBy", sortBy);
    // otherListings = await sortOtherListings(otherListings, sortBy);

    // res.status(200).json({
    //   reason: "Best deals found",
    //   statusCode: 200,
    //   status: "SUCCESS",
    //   dataObject: {
    //     bestDeals: refineBestDeals,
    //     otherListings: otherListings,
    //     totalProducts: totalProducts,
    //   },
    // });
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForShopByCategory = bestDealsForShopByCategory;

const bestDealsForShopByPrice = async (
  page,
  userUniqueId,
  // deals,
  // totalProducts,
  sortBy,
  res,
  location,
  startPrice,
  endPrice
) => {
  try {
    // todo: add location
    commonFunc(
      location,
      [startPrice, endPrice],
      page,
      userUniqueId,
      sortBy,
      res,
      "price"
    );
    // let updatedBestDeals = [];
    // let otherListings = [];

    // let favList = [];
    // if (userUniqueId !== "Guest") {
    //   const getFavObject = await favoriteModal.findOne({
    //     userUniqueId: userUniqueId,
    //   });

    //   if (getFavObject) {
    //     favList = getFavObject.fav_listings;
    //   } else {
    //     favList = [];
    //   }
    // }

    // if (userUniqueId !== "Guest") {
    //   deals.forEach((item, index) => {
    //     if (favList.includes(item.listingId)) {
    //       deals[index].favourite = true;
    //     } else {
    //       deals[index].favourite = false;
    //     }
    //   });
    // }

    // if (page == 0) {
    //   updatedBestDeals = deals.slice(0, 5);
    //   otherListings = deals.slice(5, deals.length);
    // } else {
    //   otherListings = deals;
    // }

    // let refineBestDeals = [];

    // updatedBestDeals.forEach((item, index) => {
    //   console.log("item", item.notionalPercentage);
    //   if (item.notionalPercentage > 0) {
    //     refineBestDeals.push(item);
    //   } else {
    //     otherListings.push(item);
    //   }
    // });

    // // if (sortBy === "NA") {
    // //   if (sortBy === "NA") {
    // //     otherListings.sort((a, b) => {
    // //       return (
    // //         b.notionalPercentage - a.notionalPercentage
    // //       );
    // //     });
    // //   }
    // // }

    // otherListings = await sortOtherListings(otherListings, sortBy);

    // res.status(200).json({
    //   reason: "Best deals found",
    //   statusCode: 200,
    //   status: "SUCCESS",
    //   dataObject: {
    //     bestDeals: refineBestDeals,
    //     otherListings: otherListings,
    //     totalProducts: totalProducts,
    //   },
    // });
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForShopByPrice = bestDealsForShopByPrice;
