const express = require("express");
const router = express.Router();
const saveListingModal = require("../../../database/modals/device/save_listing_device");
const favoriteModal = require("../../../database/modals/favorite/favorite_add");
const bestDealsModal = require("../../../database/modals/others/best_deals_models");
const logEvent = require('../../../middleware/log_event');
const validUser = require("../../../middleware/valid_user");
const {
  bestDealsForShopByPrice,
} = require("../../../utils/best_deals_helper_routes_v2");
const getBestDeals = require("../../../utils/get_best_deals");
const getRecommendedPrice = require("../../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../../utils/third_party_listings");

router.get("/shopbyprice/listmodel", logEvent, async (req, res) => {
  const startPrice = req.query.start;
  const endPrice = req.query.end;
  const location = req.query.listingLocation;
  const User = req.session.user;

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
    bestDealsForShopByPrice(
      page,
      userUniqueId,
      sortBy,
      res,
      location,
      startPrice,
      endPrice
    );
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
