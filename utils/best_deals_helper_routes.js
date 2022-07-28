const getBestDeals = require("./get_best_deals");
const bestDealsModal = require("../src/database/modals/others/best_deals_models");
const favoriteModal = require("../src/database/modals/favorite/favorite_add");

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
        .find({ status: "Active" })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: "Active" })
        .skip(parseInt(page) * 30)
        .limit(30);
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
        otherListings = completeDeals.slice(5, -1);
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
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, -1);
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
        .find({ status: "Active" })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: "Active" })
        .skip(parseInt(page) * 30)
        .limit(30);
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
        otherListings = completeDeals.slice(5, -1);
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
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
        })
        .skip(parseInt(page) * 30)
        .limit(30);
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, -1);
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

const bestDealsByMake = async (location, make, page, userUniqueId, res) => {
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
        .find({ status: "Active", make: make })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: "Active", make: make })
        .skip(parseInt(page) * 30)
        .limit(30);
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
        otherListings = completeDeals.slice(5, -1);
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
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          make: make,
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          make: make,
        })
        .skip(parseInt(page) * 30)
        .limit(30);
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, -1);
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

exports.bestDealsByMake = bestDealsByMake;

const bestDealsByMarketingName = async (
  location,
  marketingName,
  page,
  userUniqueId,
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
        .find({ status: "Active", marketingName: marketingName })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({ status: "Active", marketingName: marketingName })
        .skip(parseInt(page) * 30)
        .limit(30);
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
        otherListings = completeDeals.slice(5, -1);
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
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          marketingName: marketingName,
        })
        .countDocuments();
      let completeDeals = await bestDealsModal
        .find({
          status: "Active",
          $or: [{ listingLocation: location }, { listingLocation: "India" }],
          marketingName: marketingName,
        })
        .skip(parseInt(page) * 30)
        .limit(30);
      if (page == 0) {
        updatedBestDeals = completeDeals.slice(0, 5);
        otherListings = completeDeals.slice(5, -1);
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
      if (page == 0) {
        updatedBestDeals = deals.slice(0, 5);
        otherListings = deals.slice(5, -1);
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
      if (page == 0) {
        updatedBestDeals = deals.slice(0, 5);
        otherListings = deals.slice(5, -1);
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
    if (page == 0) {
      updatedBestDeals = deals.slice(0, 5);
      otherListings = deals.slice(5, -1);
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
    if (page == 0) {
      updatedBestDeals = deals.slice(0, 5);
      otherListings = deals.slice(5, -1);
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