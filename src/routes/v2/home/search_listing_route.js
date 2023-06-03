const express = require("express");
const router = express.Router();

const saveListingModal = require("../../../database/modals/device/save_listing_device");
const getThirdPartyVendors = require("../../../utils/third_party_listings");
const getRecommendedPrice = require("../../../utils/get_recommended_price");
const favoriteModal = require("../../../database/modals/favorite/favorite_add");
const getBestDeals = require("../../../utils/get_best_deals");
const logEvent = require('../../../middleware/log_event');
const bestDealsModal = require("../../../database/modals/others/best_deals_models");
const {
  bestDealsForSearchListing,
} = require("../../../utils/best_deals_helper_routes_v2");
const validUser = require("../../../middleware/valid_user");

router.post("/listings/search", logEvent, async (req, res) => {
    const User = req.session.User;

    let userUniqueId = "Guest";
    if(User){
       userUniqueId = User.userUniqueId;
       console.log(userUniqueId)
    }
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
    let allListings = [];
    let listing = [];
    let totalProducts;
    if (marketingName && marketingName.length > 0) {
      // let saveListingLength = await bestDealsModal
      //   .find({ marketingName: marketingName[0], status: ["Active", "Sold_Out"] }, { _id: 0 })
      //   .countDocuments();
      let ourListing = await bestDealsModal
        .find({ marketingName: marketingName[0], status: ["Active", "Sold_Out"] }, { _id: 0 })
        // .skip(parseInt(page) * 20)
        // .limit(20);
      listing.push(...ourListing);

    } else if (make.length > 0) {
      // let saveListingLength = await bestDealsModal
      //   .find({ make: make, status: ["Active", "Sold_Out"] }, { _id: 0 })
      //   .countDocuments();
      let ourListing = await bestDealsModal
        .find({ make: make, status: ["Active", "Sold_Out"] }, { _id: 0 })
        // .skip(parseInt(page) * 20)
        // .limit(20);
      listing.push(...ourListing);

    } else {
      // let saveListingLength = await bestDealsModal
      //   .find({ status: ["Active", "Sold_Out"] }, { _id: 0 })
      //   .countDocuments();
      let ourListing = await bestDealsModal
        .find({ status: ["Active", "Sold_Out"] }, { _id: 0 })
        // .skip(parseInt(page) * 20)
        // .limit(20);
      listing.push(...ourListing);

    }

    allListings = listing;

    if (make.length > 0) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return make.includes(item.make);
      });
      allListings = tempListings;
    }

    if (color.length > 0 && reqPage !== "TSM") {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return color.includes(item.color);
      });
      allListings = tempListings;
    }

    if (deviceStorage.length > 0) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return deviceStorage.includes(item.deviceStorage);
      });
      allListings = tempListings;
    }

    if (deviceRam.length > 0) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return deviceRam.includes(item.deviceRam);
      });
      allListings = tempListings;
    }

    if (deviceCondition.length > 0 && reqPage !== "TSM") {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return deviceCondition.includes(item.deviceCondition);
      });
      allListings = tempListings;
    }

    if (listingLocation != "India") {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return (
          item.listingLocation === listingLocation ||
          item.listingLocation === "India"
        );
      });
      allListings = tempListings;
    }

    if (parseInt(maxsellingPrice) > parseInt(minsellingPrice)) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return parseInt(item.listingPrice) <= parseInt(maxsellingPrice);
      });
      allListings = tempListings;
    }

    if (parseInt(minsellingPrice) < parseInt(maxsellingPrice)) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return parseInt(item.listingPrice) >= parseInt(minsellingPrice);
      });
      allListings = tempListings;
    }

    // if (warenty != "") {
    //   let tempListings = [];
    //   tempListings = allListings.filter((item, index) => {
    //     return item.warenty === warenty;
    //   });
    //   allListings = tempListings;
    // }

    if (warenty.length > 0 && reqPage !== "TSM") {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {

        if (warenty.includes("Brand Warranty")) {
          return item.isOtherVendor === "N";
        } else if (warenty.includes("Seller Warranty")) {
          return item.isOtherVendor === "Y";
        }
      });
      allListings = tempListings;
    }


    if (verified === true) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        if (item.verified === true) {
          return item;
        }
      });
      allListings = tempListings;
    }

    totalProducts = allListings.length;

    let location = listingLocation;

    bestDealsForSearchListing(
      location,
      page,
      userUniqueId,
      allListings,
      totalProducts,
      res
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
