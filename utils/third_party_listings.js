// const express = require("express");
// const router = express.Router();
// const moment = require("moment");
// const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

require("../src/database/connection");
// const saveListingModal = require("../../src/database/modals/device/save_listing_device");
// const createUserModal = require("../../src/database/modals/login/login_create_user");
// const connection = require("../../src/database/mysql_connection");

// const logEvent = require("../../src/middleware/event_logging");
// const getDefaultImage = require("../../utils/get_default_image");

const scrappedModal = require("../src/database/modals/others/scrapped_models");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");
const getDefaultImage = require("./get_default_image");

const getThirdPartyVendors = async (model_name, make) => {
  
  const VENDORS = {
    6: "Amazon",
    7: "Quikr",
    8: "Cashify",
    9: "2Gud",
    10: "Budli",
    11: "Paytm",
    12: "Yaantra",
    13: "Shopcluse",
    14: "Sahivalue",
    15: "Xtracover",
    16: "Mobigarage",
    17: "Instacash",
    18: "Cashforphone",
    19: "Recycledevice",
    20: "Quickmobile",
    21: "mbr_Buyblynk",
    22: "mbr_Electronicbazaar",
  };

  let filterd = [];
  if (make != "") {
    // let newFilterd = await scrappedModal.find({ type: "buy" });
    // newFilterd.filter((item) => {
    //   if (item.model_name.includes(make)) {
    //     filterd.push(item);
    //   }
    // });
    filterd = await scrappedModal.find({ type: "buy", model_name: {"$regex": make} }).limit(10);
  } else if (model_name != "") {
    filterd = await scrappedModal.find({ type: "buy", model_name: model_name }).limit(20);
  } else {
    filterd = await scrappedModal.find({ type: "buy" }).limit(50);
  }

  console.log("fffff ",filterd.length);

  let dataObject = {};
  let dataArray = [];
  filterd.forEach(async (element) => {
    let vendorName = VENDORS[element.vendor_id];
    let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/vendors/${vendorName
      .toString()
      .toLowerCase()}_logo.png`;

    // let imagePath = await getDefaultImage(element.model_name);
    // console.log("imagePath", imagePath);
    // let imagePath = getImage(element.model_name);
    let imagePath = "";
    let condition = "";
    
    if (element.mobiru_condition.includes("Like New")) {
      condition = "Like New";
    } else if (element.mobiru_condition.includes("Excellent")) {
      condition = "Excellent";
    } else if (element.mobiru_condition.includes("Good")) {
      condition = "Good";
    } else if (element.mobiru_condition.includes("Fair")) {
      condition = "Fair";
    }

    dataObject = {
      //   marketingName: element.marketing_name,
      marketingName: element.model_name,
      make: element.model_name.split(" ")[0],
      listingPrice: element.price.toString(),
      deviceStorage: element.storage === "0 GB" || element.storage === "--" ? "--" : (element.storage.toString() + " GB"),
      warranty: element.warranty,
      vendorLogo: vendorImage,
      vendorLink: element.link,
      vendorId: element.vendor_id,
      isOtherVendor: "Y",
      imagePath: imagePath,
      verified: false,
      favourite: false,
      listingLocation: "India",
      deviceFinalGrade: null,
      deviceCondition: condition,
      listingId: element._id,
      listingDate: "",
      modifiedDate: "",
      verifiedDate: "",
      charger: "Y",
      earphone: "Y",
      originalbox: "Y",
      defaultImage: {
        fullImage: "",
        // fullImage: imagePath,
      },
      // images: [{
      //   fullImage: imagePath,
      //   thumbnailImage: imagePath,
      // }]
      images: [],
    };

    dataArray.push(dataObject);
    console.log("dataArray", dataArray.length);
  });

  return dataArray;
};

module.exports = getThirdPartyVendors;
