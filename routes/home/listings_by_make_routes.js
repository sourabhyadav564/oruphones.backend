const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const listingByMakeModal = require("../../src/database/modals/listing/listing_by_make");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const validUser = require("../../src/middleware/valid_user");
const {
  bestDealsByMake,
  bestDealsByMarketingName,
} = require("../../utils/best_deals_helper_routes");
const getBestDeals = require("../../utils/get_best_deals");
// const getBestDeals = require("../../utils/get_best_deals");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/listingsbymake", validUser, logEvent, async (req, res) => {
  // const initialMake = req.query.make;
  let make = req.query.make;
  const userUniqueId = req.query.userUniqueId;
  const location = req.query.listingLocation;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined) {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  // let make;
  // initialMake.split(" ").map((currentValue) => {
  //   make = currentValue[0].toUpperCase() + currentValue.slice(1);
  // });

  let tempMake = make.toLowerCase();

  switch (tempMake) {
    case "samsung":
      make = "Samsung";
      break;
    case "oneplus":
      make = "OnePlus";
      break;
    case "huawei":
      make = "Huawei";
      break;
    case "xiaomi":
      make = "Xiaomi";
      break;
    case "vivo":
      make = "Vivo";
      break;
    case "oppo":
      make = "Oppo";
      break;
    case "google":
      make = "Google";
      break;
    case "htc":
      make = "HTC";
      break;
    case "lenovo":
      make = "Lenovo";
      break;
    case "apple":
      make = "Apple";
      break;
    case "sony":
      make = "Sony";
      break;
    case "nokia":
      make = "Nokia";
      break;
    case "infinix":
      make = "Infinix";
      break;
    case "acer":
      make = "Acer";
      break;
    case "asus":
      make = "Asus";
      break;
    case "honor":
      make = "Honor";
      break;
    case "microsoft":
      make = "Microsoft";
      break;
    case "lg":
      make = "LG";
      break;
    case "alcatel":
      make = "Alcatel";
      break;
    case "micromax":
      make = "Micromax";
      break;
    case "motorola":
      make = "Motorola";
      break;
    case "panasonic":
      make = "Panasonic";
      break;
    case "realme":
      make = "Realme";
      break;
    case "tenco":
      make = "Tenco";
      break;
    case "lava":
      make = "Lava";
      break;
    case "gionee":
      make = "Gionee";
      break;
    case "tenco":
      make = "Tenco";
      break;
    case "intex":
      make = "Intex";
      break;
    case "meizu":
      make = "Meizu";
      break;
  }

  bestDealsByMake(location, make, page, userUniqueId, sortBy, res);
});

router.get("/listbymarketingname", validUser, logEvent, async (req, res) => {
  const marketingname = req.query.marketingName;
  const userUniqueId = req.query.userUniqueId;
  const location = req.query.location;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined) {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  bestDealsByMarketingName(
    location,
    marketingname,
    page,
    userUniqueId,
    sortBy,
    res
  );
});

module.exports = router;
