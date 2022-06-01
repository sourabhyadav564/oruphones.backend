const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const scrappedModal = require("../../src/database/modals/others/scrapped_models");
const allMatrix = require("../../utils/matrix_figures");

router.post("/price/externalsellsource", async (req, res) => {
  const deviceStorage = req.body.deviceStorage;
  const make = req.body.make;
  const marketingName = req.body.marketingName;
  const deviceCondition = req.body.deviceCondition;
  const hasCharger = req.body.hasCharger;
  const hasEarphone = req.body.hasEarphone;
  const hasOrignalBox = req.body.hasOrignalBox;
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
  console.log("Total1: ", totalPercentageToBeReduced);
  if (hasEarphone === "N") {
    totalPercentageToBeReduced += earphonePercentage;
  }
  console.log("Total2: ", totalPercentageToBeReduced);
  if (hasOrignalBox === "N") {
    totalPercentageToBeReduced += originalBoxPercentage;
  }
  console.log("Total3: ", totalPercentageToBeReduced);

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

  try {
    const listings = await scrappedModal.find({
      type: "sell",
      storage: deviceStorage || '--',
      model_name: marketingName,
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
      listings.forEach(async (element) => {
        let filterData = {};
        let vendorName = VENDORS[element.vendor_id];
        let finalPrice =
          element.actualPrice != null
            ? element.actualPrice -
              (element.actualPrice * totalPercentageToBeReduced) / 100
            : 0;
        finalPrice = Math.ceil(finalPrice);
        let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/vendors/${vendorName
          .toString()
          .toLowerCase()}_logo.png`;
        filterData["externalSourcePrice"] =
          element.actualPrice != null ? finalPrice.toString() : "";
        filterData["externalSourceImage"] = vendorImage;
        finalDataArray.push(filterData);
      });

      finalDataArray.filter((element) => {
        if (element.actualPrice === "") {
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
          dataToBeSend.length <= 2 &&
          !extrData.includes(element.externalSourceImage) &&
          element.externalSourceImage.includes("cashify")
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
        reason: "Listing found",
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
