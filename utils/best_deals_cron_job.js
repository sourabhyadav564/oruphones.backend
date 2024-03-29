const express = require("express");
const saveListingModal = require("../src/database/modals/device/save_listing_device");
const getBestDeals = require("./get_best_deals");
const getThirdPartyVendors = require("./third_party_listings");

const startSavingBestDeals = async () => {
  const location = "India";
  const userUniqueId = "Guest";

  try {
    let defaultDataObject = [];
    let totalProducts;
    if (location === "India") {
      let saveListingLength = await saveListingModal
        .find({
          status: ["Active", "Sold_Out"],
        })
        .countDocuments();
      let defaultDataObject2 = await saveListingModal.find({
        status: ["Active", "Sold_Out"],
      });
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      const thirdPartyVendors = await getThirdPartyVendors("", "");
      thirdPartyVendors?.dataArray?.forEach((thirdPartyVendor) => {
        defaultDataObject.push(thirdPartyVendor);
      });
      totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
    } else {
      let saveListingLength = await saveListingModal
        .find({
          listingLocation: location,
          status: ["Active", "Sold_Out"],
        })
        .countDocuments();
      let defaultDataObject2 = await saveListingModal.find({
        listingLocation: location,
        status: ["Active", "Sold_Out"],
      });
      const thirdPartyVendors = await getThirdPartyVendors("", "");
      thirdPartyVendors?.dataArray?.forEach((thirdPartyVendor) => {
        defaultDataObject2.push(thirdPartyVendor);
      });
      totalProducts = saveListingLength + thirdPartyVendors?.dataLength;
      if (!defaultDataObject2.length) {
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
        defaultDataObject.push(...defaultDataObject2);
      }
    }

    getBestDeals(defaultDataObject, userUniqueId, false);
  } catch (error) {
    console.log(error);
  }
};

const startCalculatingBestDeals = async () => {
  startSavingBestDeals();
};

module.exports = startCalculatingBestDeals;
