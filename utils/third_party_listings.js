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

const getThirdPartyVendors = async (model_name, make, page) => {
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
    23: "Flipkart",
  };

  let filterd = [];
  if (make != "") {
    // let newFilterd = await scrappedModal.find({ type: "buy" });
    // newFilterd.filter((item) => {
    //   if (item.model_name.includes(make)) {
    //     filterd.push(item);
    //   }
    // });
    // filterd = await testScrappedModal
    //   .find({ type: "buy", model_name: { $regex: make.toLowerCase(), $options: "i" } })
    //   .limit(10);
    filterd = await testScrappedModal
      .find({
        type: "buy",
        model_name: { $regex: make },
      })
      .skip(parseInt(page) * 50)
      .limit(50);
  } else if (model_name != "") {
    // filterd = await testScrappedModal
    //   .find({ type: "buy", model_name: { $regex: model_name.toLowerCase(), $options: "i" } })
    //   .limit(20);
    filterd = await testScrappedModal
      .find({
        type: "buy",
        model_name: model_name,
      })
      .skip(parseInt(page) * 50)
      .limit(50);
  } else {
    filterd = await testScrappedModal
      .find({ type: "buy" })
      .skip(parseInt(page) * 50)
      .limit(50);
  }

  let dataObject = {};
  let dataArray = [];
  filterd.forEach(async (element) => {
    let vendorName = VENDORS[element.vendor_id];
    let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
      .toString()
      .toLowerCase()}_logo.png`;

    // let imagePath = await getDefaultImage(element.model_name);
    // let imagePath = getImage(element.model_name);
    let imagePath = "";
    let condition = "";

    if (
      element.mobiru_condition.includes("Like New") ||
      element.mobiru_condition.includes("Superb")
    ) {
      condition = "Like New";
    } else if (
      element.mobiru_condition.includes("Excellent") ||
      element.mobiru_condition.includes("Very Good")
    ) {
      condition = "Excellent";
    } else if (element.mobiru_condition.includes("Good")) {
      condition = "Good";
    } else if (element.mobiru_condition.includes("Fair")) {
      condition = "Fair";
    }
    dataObject = {
      //   marketingName: element.marketing_name,
      marketingName: element.model_name == null ? "--" : element.model_name,
      make:
        element.model_name == null ? "--" : element.model_name.split(" ")[0],
      listingPrice: element.price == null ? "--" : element.price.toString(),
      deviceStorage:
        element.storage === "0 GB" ||
        element.storage === "--" ||
        element.storage == null
          ? "--"
          : `${element.storage} GB`,
      warranty: element.warranty,
      vendorLogo: vendorImage,
      vendorLink: element.link ? element.link : "",
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
  });

  return dataArray;
};

module.exports = getThirdPartyVendors;
