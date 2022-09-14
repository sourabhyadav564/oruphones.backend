const getBestDeals = require("./get_best_deals");
const bestDealsModal = require("../src/database/modals/others/best_deals_models");
const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const saveListingModal = require("../src/database/modals/device/save_listing_device");
const applySortFilter = require("./sort_filter");

// SORY BY KEYS

// LTH
// HTL
// NF
// OF

const bestDealsNearMe = async (location, page, userUniqueId, res) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];
    let totalProducts;

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (location === "India") {

      totalProducts = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (userUniqueId !== "Guest") {
        // add favorite listings to the final list
        completeDeals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            completeDeals[index].favourite = true;
          } else {
            completeDeals[index].favourite = false;
          }
        });
      }
      console.log({ completeDealslength: completeDeals.length });
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    } else {
      totalProducts = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
      //   status: ["Active", "Sold_Out"],
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    }
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsNearMe = bestDealsNearMe;

const bestDealsNearAll = async (location, page, userUniqueId, res) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];
    let totalProducts;

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (location === "India") {
      totalProducts = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (userUniqueId !== "Guest") {
        // add favorite listings to the final list
        completeDeals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            completeDeals[index].favourite = true;
          } else {
            completeDeals[index].favourite = false;
          }
        });
      }
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    } else {
      totalProducts = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
      //   status: ["Active", "Sold_Out"],
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    }
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsNearAll = bestDealsNearAll;

const bestDealsByMake = async (location, make, page, userUniqueId, sortBy, res) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];
    let totalProducts;

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (location === "India") {      
      const fitlerResults = await applySortFilter(sortBy, make, page);

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      //   make: make,
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);
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
      if (page == 0) {
        updatedBestDeals = fitlerResults.completeDeals.slice(0, 5);
        otherListings = fitlerResults.completeDeals.slice(5, fitlerResults.completeDeals.length);
      } else {
        otherListings = fitlerResults.completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: fitlerResults.totalProducts,
        },
      });
    } else {
      const fitlerResults = await applySortFilter(sortBy, make, page);

      // let getSavedDeals = await saveListingModal.find({
      //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
      //   status: ["Active", "Sold_Out"],
      //   make: make,
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = fitlerResults.completeDeals.slice(0, 5);
        otherListings = fitlerResults.completeDeals.slice(5, fitlerResults.completeDeals.length);
      } else {
        otherListings = fitlerResults.completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: fitlerResults.totalProducts,
        },
      });
    }
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
    let updatedBestDeals = [];
    let otherListings = [];
    let totalProducts;

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (location === "India") {
      totalProducts = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"], marketingName: marketingName })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"], marketingName: marketingName })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      //   marketingName: marketingName,
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);
      if (userUniqueId !== "Guest") {
        // add favorite listings to the final list
        completeDeals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            completeDeals[index].favourite = true;
          } else {
            completeDeals[index].favourite = false;
          }
        });
      }
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    } else {
      totalProducts = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          marketingName: marketingName,
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: ["Active", "Sold_Out"],
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          marketingName: marketingName,
        })
        .skip(parseInt(page) * 30)
        .limit(30);

      // let getSavedDeals = await saveListingModal.find({
      //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
      //   status: ["Active", "Sold_Out"],
      //   marketingName: marketingName,
      // });

      // completeDeals = completeDeals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, completeDeals.length);
      } else {
        otherListings = completeDeals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    }
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
  deals,
  totalProducts,
  res
) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (location === "India") {
      if (userUniqueId !== "Guest") {
        deals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            deals[index].favourite = true;
          } else {
            deals[index].favourite = false;
          }
        });
      }

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      // });

      // deals = deals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = deals.slice(0, 5);
        otherListings = deals.slice(5, deals.length);
      } else {
        otherListings = deals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    } else {
      if (userUniqueId !== "Guest") {
        deals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            deals[index].favourite = true;
          } else {
            deals[index].favourite = false;
          }
        });
      }

      // let getSavedDeals = await saveListingModal.find({
      //   status: ["Active", "Sold_Out"],
      //   $or: [{ listingLocation: location }, { listingLocation: "India" }],
      // });

      // deals = deals.concat(getSavedDeals);

      if (page == 0) {
        updatedBestDeals = deals.slice(0, 5);
        otherListings = deals.slice(5, deals.length);
      } else {
        otherListings = deals;
      }
      res.status(200).json({
        reason: "Best deals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          bestDeals: updatedBestDeals,
          otherListings: otherListings,
          totalProducts: totalProducts,
        },
      });
    }
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForSearchListing = bestDealsForSearchListing;

const bestDealsForShopByCategory = async (
  page,
  userUniqueId,
  deals,
  totalProducts,
  res
) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (userUniqueId !== "Guest") {
      deals.forEach((item, index) => {
        if (favList.includes(item.listingId)) {
          deals[index].favourite = true;
        } else {
          deals[index].favourite = false;
        }
      });
    }

    // let getSavedDeals = await saveListingModal.find({
    //   status: ["Active", "Sold_Out"],
    // });

    // deals = deals.concat(getSavedDeals);

    if (page == 0) {
      updatedBestDeals = deals.slice(0, 5);
      otherListings = deals.slice(5, deals.length);
    } else {
      otherListings = deals;
    }
    res.status(200).json({
      reason: "Best deals found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        bestDeals: updatedBestDeals,
        otherListings: otherListings,
        totalProducts: totalProducts,
      },
    });
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForShopByCategory = bestDealsForShopByCategory;

const bestDealsForShopByPrice = async (
  page,
  userUniqueId,
  deals,
  totalProducts,
  res
) => {
  try {
    let updatedBestDeals = [];
    let otherListings = [];

    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    if (userUniqueId !== "Guest") {
      deals.forEach((item, index) => {
        if (favList.includes(item.listingId)) {
          deals[index].favourite = true;
        } else {
          deals[index].favourite = false;
        }
      });
    }

    // let getSavedDeals = await saveListingModal.find({
    //   status: ["Active", "Sold_Out"],
    // });

    // deals = deals.concat(getSavedDeals);
    if (page == 0) {
      updatedBestDeals = deals.slice(0, 5);
      otherListings = deals.slice(5, deals.length);
    } else {
      otherListings = deals;
    }
    res.status(200).json({
      reason: "Best deals found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        bestDeals: updatedBestDeals,
        otherListings: otherListings,
        totalProducts: totalProducts,
      },
    });
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

exports.bestDealsForShopByPrice = bestDealsForShopByPrice;
