const express = require("express");
const router = express.Router();

// const bestDealHomeModel = require("../../../database/modals/home/best_deals_home");
const saveListingModal = require("../../../database/modals/device/save_listing_device");
const favoriteModal = require("../../../database/modals/favorite/favorite_add");
const bestDealsModal = require("../../../database/modals/others/best_deals_models");
// const favoriteModal = require("../database/modals/favorite/favorite_add");
const logEvent = require('../../../middleware/log_event');
const validUser = require("../../../middleware/valid_user");
const {
  bestDealsForShopByCategory,
} = require("../../../utils/best_deals_helper_routes_v2");
const getBestDeals = require("../../../utils/get_best_deals");
const getRecommendedPrice = require("../../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../../utils/third_party_listings");

router.get("/listings/category", logEvent, async (req, res) => {
  const location = req.query.location;
  const category = req.query.category;
  const User = req.session.User;

  let userUniqueId = "Guest";
  if(User){
     userUniqueId = User.userUniqueId;
     console.log(userUniqueId)
  }

  let page = req.query.pageNumber;
  page = parseInt(page.toString());
  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined || sortBy == "Featured" || sortBy == "undefined") {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  try {
    bestDealsForShopByCategory(
      page,
      userUniqueId,
      // defaultDataObject,
      // totalProducts,
      sortBy,
      res,
      location,
      category
    );
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
});

module.exports = router