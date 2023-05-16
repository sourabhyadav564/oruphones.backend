// const express = require("express");
// const router = express.Router();
const moment = require("moment");
// const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

require("../src/database/connection");
// const saveListingModal = require("../../src/database/modals/device/save_listing_device");
// const createUserModal = require("../../src/database/modals/login/login_create_user");
// const connection = require("../../src/database/mysql_connection");

// const logEvent = require("../../src/middleware/event_logging");
// const getDefaultImage = require("../../utils/get_default_image");

const scrappedModal = require("../src/database/modals/others/scrapped_models");
const testDefaultImageModal = require("../src/database/modals/others/test_model_default_images");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");
const getDefaultImage = require("./get_default_image");
const { newModelImages } = require("./models_util");
const allImageUrls = [];

const getThirdPartyVendors = async (model_name, make, page) => {
  if (allImageUrls.length == 0) {
    const modalImageData = await testDefaultImageModal.find(
      {
        // get only whose updatedAt is greater than 30 days
        updatedAt: {
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
      { _id: 0 }
    );
    modalImageData.forEach((element) => {
      allImageUrls.push(element);
    });
  }
  let dataLength = 0;
  const VENDORS = {
    6: "Amazon",
    7: "Quikr",
    8: "Cashify",
    9: "2Gud",
    10: "Budli",
    11: "Paytm",
    12: "Yaantra",
    13: "Sahivalue",
    14: "Shopcluse",
    15: "Xtracover",
    16: "Mobigarage",
    17: "Instacash",
    18: "Cashforphone",
    19: "Recycledevice",
    20: "Quickmobile",
    21: "mbr_Buyblynk",
    22: "mbr_Electronicbazaar",
    23: "Flipkart",
    26: "OLX",
  };

  let filterd = [];
  // if (make != "") {
  //   dataLength = await testScrappedModal
  //     .find({
  //       type: "buy",
  //       model_name: { $regex: make.toLowerCase(), $options: "i" },
  //     })
  //     .countDocuments();
  //   filterd = await testScrappedModal.find({
  //     type: "buy",
  //     model_name: { $regex: make },
  //   });
  //   // .skip(parseInt(page) * 20)
  //   // .limit(20);
  // } else if (model_name != "") {
  //   dataLength = await testScrappedModal
  //     .find({
  //       type: "buy",
  //       model_name: model_name,
  //     })
  //     .countDocuments();

  //   filterd = await testScrappedModal.find({
  //     type: "buy",
  //     model_name: model_name,
  //   });
  //   // .skip(parseInt(page) * 20)
  //   // .limit(20);
  // } else {
  //   dataLength = await testScrappedModal.find({ type: "buy" }).countDocuments();
  //   filterd = await testScrappedModal.find({ type: "buy" });
  //   // .skip(parseInt(page) * 20)
  //   // .limit(20);
  // }

  let exper = { type: "buy", vendor_id: { $ne: 26 } };
  if (make != "") {
    exper = {
      ...exper,
      model_name: { $regex: make.toLowerCase(), $options: "i" },
    };
  } else if (model_name != "") {
    exper = {
      ...exper,
      model_name: model_name,
    };
  }

  filterd = await testScrappedModal.find(exper);
  // dataLength = await testScrappedModal.find(exper).countDocuments();
  dataLength = filterd.length;

  let dataObject = {};
  let dataArray = [];
  // filterd.forEach(async (element) => {
  for (let i = 0; i < filterd.length; i++) {
    let element = filterd[i];
    element = element._doc;
    let vendorName = VENDORS[element.vendor_id];
    let vendorImage = `https://d1tl44nezj10jx.cloudfront.net/devImg/vendors/${vendorName
      .toString()
      .toLowerCase()}_logo.png`;

    // let imagePath = await getDefaultImage(element.model_name);
    // let imagePath = getImage(element.model_name);
    // let imagePath = "";
    let tempModel = element.model_name.toLowerCase().replace("+", "plus");
    // allImageUrls.find((item) => {
    //   if (item.name == tempModel) {
    //     imagePath = item.img;
    //   }
    // });
    let imagePath = newModelImages[tempModel] || "";
    // let imagePath = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/allModelsImg/${element.model_name
    //   .toString()
    //   .toLowerCase()
    //   .repalce(/+/g, "plus")}.jpg`;
    let condition = element.mobiru_condition;

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
      deviceRam:
        element.ram === "0 GB" ||
        element.storage === "--" ||
        element.storage == null
          ? "--"
          : `${element.ram} GB`,
      warranty: element.warranty ? element.warranty : "None",
      vendorLogo: vendorImage,
      vendorLink: element.link ? element.link : "",
      vendorId: element.vendor_id,
      isOtherVendor: "Y",
      imagePath: imagePath,
      verified: false,
      favourite: false,
      listingLocation: "India",
      deviceFinalGrade: " ",
      deviceCosmeticGrade: " ",
      deviceFunctionalGrade: " ",
      imei: " ",
      model: element.model_name == null ? "--" : element.model_name,
      deviceCondition: condition,
      // put value of ObjectId of _id in listingId
      listingId: element._id.toString(),
      listingDate: element.createdAt,
      modifiedDate: "",
      verifiedDate: " ",
      charger: "Y",
      earphone: "N",
      originalbox: "Y",
      defaultImage: {
        // fullImage: "",
        fullImage: imagePath,
      },
      images: [
        {
          fullImage: imagePath,
          thumbImage: imagePath,
        },
      ],
      // images: [],
      status: "Active",
      createdAt: element.createdAt ? element.createdAt : element.created_at,
    };

    dataArray.push(dataObject);
  }

  return { dataArray, dataLength };
};

module.exports = getThirdPartyVendors;
