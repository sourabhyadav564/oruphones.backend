const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const getThirdPartyVendors = require("../../utils/third_party_listings");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const getBestDeals = require("../../utils/get_best_deals");
const logEvent = require("../../src/middleware/event_logging");

router.post("/listings/search", logEvent, async (req, res) => {
  const userUniqueId = req.query.userUniqueId;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceStorage = req.body.deviceStorage;
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
      let saveListingLength = await saveListingModal
        .find({ marketingName: marketingName[0], status: "Active" }, { _id: 0 })
        .countDocuments();
      let ourListing = await saveListingModal
        .find({ marketingName: marketingName[0], status: "Active" }, { _id: 0 })
        .skip(parseInt(page) * 20)
        .limit(20);
      listing.push(...ourListing);
      i = 0;
      while (i < marketingName.length) {
        let newListings = await getThirdPartyVendors(
          marketingName[i],
          "",
          page
        );
        newListings?.dataArray?.forEach((thirdPartyVendor) => {
          listing.push(thirdPartyVendor);
        });
        i++;
        totalProducts = saveListingLength + newListings?.dataLength;
      }
    } else if (make.length > 0) {
      let saveListingLength = await saveListingModal
        .find({ make: make, status: "Active" }, { _id: 0 })
        .countDocuments();
      let ourListing = await saveListingModal
        .find({ make: make, status: "Active" }, { _id: 0 })
        .skip(parseInt(page) * 20)
        .limit(20);
      listing.push(...ourListing);
      i = 0;
      while (i < make.length) {
        let newListings = await getThirdPartyVendors("", make[i], page);
        newListings?.dataArray?.forEach((thirdPartyVendor) => {
          listing.push(thirdPartyVendor);
        });
        i++;
        totalProducts = saveListingLength + newListings?.dataLength;
      }
    } else {
      let saveListingLength = await saveListingModal
        .find({ status: "Active" }, { _id: 0 })
        .countDocuments();
      let ourListing = await saveListingModal
        .find({ status: "Active" }, { _id: 0 })
        .skip(parseInt(page) * 20)
        .limit(20);
      listing.push(...ourListing);
      const thirdPartyVendors = await getThirdPartyVendors("", "", page);
      newListings?.dataArray?.forEach((thirdPartyVendor) => {
        listing.push(thirdPartyVendor);
      });
      totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
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
        return item.listingLocation === listingLocation;
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

    if (warenty != "") {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        return item.warenty === warenty;
      });
      allListings = tempListings;
    }

    if (verified === true) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        if (item.verified === true) {
          return true;
        }
      });
      allListings = tempListings;
    }

    let location = listingLocation;

    let defaultDataObject = [];
    if (location === "India") {
      let defaultDataObject2 = allListings;
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      // const thirdPartyVendors = await getThirdPartyVendors("", "");
      // thirdPartyVendors.forEach((thirdPartyVendor) => {
      //   defaultDataObject.push(thirdPartyVendor);
      // });
    } else {
      // defaultDataObject = await bestDealHomeModel.find({
      // defaultDataObject = await saveListingModal.find({
      //   listingLocation: location,
      // });
      defaultDataObject = allListings;
    }

    getBestDeals(defaultDataObject, userUniqueId, res, false, totalProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
