const express = require("express");
const lspModal = require("../../src/database/modals/others/new_scrapped_models");
const router = express.Router();

require("../../src/database/connection");
const scrappedModal = require("../../src/database/modals/others/scrapped_models");
const testScrappedModal = require("../../src/database/modals/others/test_scrapped_models");
const logEvent = require("../../src/middleware/event_logging");
const allMatrix = require("../../utils/matrix_figures");
const fs = require("fs");

router.post("/price/externalsellsource", logEvent, async (req, res) => {
  const deviceStorage = req.body.deviceStorage.split("GB")[0];
  const deviceRam = req.body.deviceRam.split("GB")[0];
  let make = req.body.make;
  let marketingName = req.body.marketingName;
  const deviceCondition = req.body.deviceCondition;
  const hasCharger = req.body.hasCharger;
  const hasEarphone = req.body.hasEarphone;
  const hasOriginalBox = req.body.hasOriginalBox;
  let warrantyPeriod = req.body.warrantyPeriod;

  let chargerPercentage = allMatrix.externalSellSourceFigures.chargerPercentage;
  let earphonePercentage =
    allMatrix.externalSellSourceFigures.earphonePercentage;
  let originalBoxPercentage =
    allMatrix.externalSellSourceFigures.originalBoxPercentage;

  let warrantyPeriodPercentage;
  switch (warrantyPeriod) {
    case "zero":
      warrantyPeriodPercentage =
        allMatrix.externalSellSourceFigures.zeroToThreeAgePercentage;
      break;
    case "four":
      warrantyPeriodPercentage =
        allMatrix.externalSellSourceFigures.fourToSixAgePercentage;
      break;
    case "seven":
      warrantyPeriodPercentage =
        allMatrix.externalSellSourceFigures.sevenToElevenAgePercentage;
      break;
    case "more":
      warrantyPeriodPercentage =
        allMatrix.externalSellSourceFigures.moreThanElevenAgePercentage;
      break;
    default:
      warrantyPeriodPercentage =
        allMatrix.externalSellSourceFigures.moreThanElevenAgePercentage;
      break;
  }

  let totalPercentageToBeReduced = 0;
  totalPercentageToBeReduced += warrantyPeriodPercentage;

  if (hasCharger === "N") {
    totalPercentageToBeReduced += chargerPercentage;
  }
  if (hasEarphone === "N") {
    totalPercentageToBeReduced += earphonePercentage;
  }
  if (hasOriginalBox === "N") {
    totalPercentageToBeReduced += originalBoxPercentage;
  }

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

  try {
    // const listings = await scrappedModal.find({
    //   type: "sell",
    //   storage: [deviceStorage, '--'],
    //   model_name: marketingName,
    //   mobiru_condition: deviceCondition,
    // });

    // const listings = await lspModal.find({
    //   type: "sell",
    //   storage: [deviceStorage, "--", "-- GB"],
    //   ram: [deviceRam, "--", "-- GB"],
    //   make: make,
    //   model: marketingName,
    //   condition: deviceCondition,
    // });

    let exact_model_name = "";
    const allgsmData = JSON.parse(fs.readFileSync("gsm_arena_filtered.json"));
    allgsmData.forEach((element) => {
      if (element.marketingName.includes(marketingName)) {
        exact_model_name = element.marketingName;
      }
    });
    let tempModelName = marketingName.toLowerCase();

    if (tempModelName.includes("iphone")) {
      tempModelName = marketingName.replace("iPhone", "Iphone");
    }

    const listings = await testScrappedModal.find({
      type: "sell",
      storage: [parseInt(deviceStorage), "--", "-- GB"],
      ram: [parseInt(deviceRam), "--", "-- GB"],
      make: make,
      model_name: [marketingName, exact_model_name, tempModelName],
      mobiru_condition: deviceCondition,
    });

    if (!listings.length) {
      res.status(200).json({
        reason: "Listing not found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: [],
      });
    } else {
      let finalDataArray = [];
      let vendorListings = [];

      // listings.forEach((listing) => {
      //   listing.vendor.forEach((vendor) => {
      //     if (vendor.type == "sell") {
      //       vendorListings.push(vendor);
      //     }
      //   });
      // });

      listings.forEach((element) => {
        if (element.type === "sell") {
          vendorListings.push({
            vendor_id: element.vendor_id,
            price: element.price,
          });
        }
      });

      vendorListings.forEach(async (element) => {
        let filterData = {};
        let vendorName = VENDORS[element.vendor_id];
        let finalPrice;
        if (element.vendor_id != 6) {
          finalPrice =
            element.price != null
              ? element.price -
                (element.price * totalPercentageToBeReduced) / 100
              : 0;
        } else {
          finalPrice = element.price;
        }
        finalPrice = Math.ceil(finalPrice);
        let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
          .toString()
          .toLowerCase()}_logo.png`;
        filterData["externalSourcePrice"] =
          element.price != null ? finalPrice.toString() : "";
        filterData["externalSourceImage"] = vendorImage;
        finalDataArray.push(filterData);
      });

      finalDataArray.filter((element) => {
        if (element.price === "") {
          finalDataArray.splice(finalDataArray.indexOf(element), 1);
        }
      });

      finalDataArray.sort((a, b) => {
        return (
          parseInt(a.externalSourcePrice) - parseInt(b.externalSourcePrice)
        );
      });

      let dataToBeSend = [];
      let extrData = [];

      finalDataArray.forEach((element, index) => {
        if (
          dataToBeSend.length <= 1 &&
          !extrData.includes(element.externalSourceImage) &&
          element.externalSourceImage.includes("amazon_logo")
        ) {
          dataToBeSend.push(element);
          extrData.push(element.externalSourceImage);
        }
      });

      finalDataArray.forEach((element, index) => {
        if (
          dataToBeSend.length <= 1 &&
          !extrData.includes(element.externalSourceImage) &&
          element.externalSourceImage.includes("flipkart_logo")
        ) {
          dataToBeSend.push(element);
          extrData.push(element.externalSourceImage);
        }
      });

      finalDataArray.forEach((element, index) => {
        if (
          dataToBeSend.length <= 2 &&
          !extrData.includes(element.externalSourceImage) &&
          element.externalSourceImage.includes("ashify_logo")
        ) {
          dataToBeSend.push(element);
          extrData.push(element.externalSourceImage);
        }
      });

      finalDataArray.forEach((element, index) => {
        if (
          dataToBeSend.length <= 12 &&
          !extrData.includes(element.externalSourceImage)
        ) {
          dataToBeSend.push(element);
          extrData.push(element.externalSourceImage);
        }
      });
      res.status(200).json({
        reason: "External Sell Source found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: dataToBeSend,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
