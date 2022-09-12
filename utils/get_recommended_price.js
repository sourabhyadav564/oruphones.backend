const express = require("express");
// const connection = require("../src/database/mysql_connection");

const scrappedModal = require("../src/database/modals/others/scrapped_models");
const smartphoneModal = require("../src/database/modals/others/smartphone_models");
const allMatrix = require("../utils/matrix_figures");

const NodeCache = require("node-cache");
const lspModal = require("../src/database/modals/others/new_scrapped_models");
const myCache = new NodeCache({ stdTTL: 10, checkperiod: 120 });

const getRecommendedPrice = async (
  make,
  marketingname,
  condition,
  storage,
  ram,
  hasCharger,
  isAppleChargerIncluded,
  hasEarphone,
  isAppleEarphoneIncluded,
  hasOrignalBox,
  isVarified,
  isForMarketingName,
  warrantyPeriod
) => {
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
  };

  try {
    let scrappedModels = [];
    scrappedModels = await lspModal.find({
      model: marketingname,
      storage: [storage],
      condition: condition,
      ram: [ram],
    });

    if(scrappedModels.length == 0) {
      scrappedModels = await lspModal.find({
        model: marketingname,
        storage: [storage],
        condition: condition
      });
    }

    if (scrappedModels.length > 0) {
      let leastSellingPrice;
      let lowerRangeMatrix = allMatrix.recommendedPriceFigures.lowerRangeMatrix;
      let upperRangeMatrix = allMatrix.recommendedPriceFigures.upperRangeMatrix;
      let isAppleCharger = allMatrix.recommendedPriceFigures.isAppleCharger;
      let isNonAppleCharger =
        allMatrix.recommendedPriceFigures.isNonAppleCharger;
      let isAppleEarphone = allMatrix.recommendedPriceFigures.isAppleEarphone;
      let isNonAppleEarphone =
        allMatrix.recommendedPriceFigures.isNonAppleEarphone;
      let isOriginalBox = allMatrix.recommendedPriceFigures.isOriginalBox;
      // let warrantyZeroToThree =
      //   allMatrix.recommendedPriceFigures.zeroToThreeAgePercentage;
      // let warrantyFourToSix =
      //   allMatrix.recommendedPriceFigures.fourToSixAgePercentage;
      // let warrantySevenToEleven =
      //   allMatrix.recommendedPriceFigures.sevenToElevenAgePercentage;
      // let moreThanElevenAgePercentage =
      //   allMatrix.recommendedPriceFigures.moreThanElevenAgePercentage;
      let varified = allMatrix.recommendedPriceFigures.varified;

      let warrantyPeriodPercentage;
      switch (warrantyPeriod) {
        case "zero":
          warrantyPeriodPercentage =
            allMatrix.recommendedPriceFigures.zeroToThreeAgePercentage;
          break;
        case "four":
          warrantyPeriodPercentage =
            allMatrix.recommendedPriceFigures.fourToSixAgePercentage;
          break;
        case "seven":
          warrantyPeriodPercentage =
            allMatrix.recommendedPriceFigures.sevenToElevenAgePercentage;
          break;
        case "more":
          warrantyPeriodPercentage =
            allMatrix.recommendedPriceFigures.moreThanElevenAgePercentage;
          break;
        default:
          warrantyPeriodPercentage =
            allMatrix.recommendedPriceFigures.moreThanElevenAgePercentage;
          break;
      }

      let totalPercentageToBeAdd = 0;
      totalPercentageToBeAdd += warrantyPeriodPercentage;

      if (hasCharger) {
        if (isAppleChargerIncluded) {
          totalPercentageToBeAdd += isAppleCharger;
        } else {
          totalPercentageToBeAdd += isNonAppleCharger;
        }
      }
      if (hasEarphone) {
        if (isAppleEarphoneIncluded) {
          totalPercentageToBeAdd += isAppleEarphone;
        } else {
          totalPercentageToBeAdd += isNonAppleEarphone;
        }
      }
      if (hasOrignalBox) {
        totalPercentageToBeAdd += isOriginalBox;
      }
      if (isVarified == true) {
        totalPercentageToBeAdd += varified;
      }

      let gotDataFrom = "";
      let gotType = "";
      gotType = scrappedModels[0].type;
      
      leastSellingPrice = scrappedModels[0].lsp;

      let bool = false;


      if (gotType === "sell") {
        let price_with_added_percentage = make === "Samsung" ? 1.4 : 1.2;
        leastSellingPrice = leastSellingPrice * price_with_added_percentage;
      }

      let recommendedPriceRangeLowerLimit =
        lowerRangeMatrix * leastSellingPrice;
      let recommendedPriceRangeUpperLimit =
        upperRangeMatrix * leastSellingPrice;

      recommendedPriceRangeLowerLimit = Math.ceil(
        recommendedPriceRangeLowerLimit +
          (leastSellingPrice * totalPercentageToBeAdd) / 100
      );

      recommendedPriceRangeUpperLimit = Math.ceil(
        recommendedPriceRangeUpperLimit +
          (leastSellingPrice * totalPercentageToBeAdd) / 100
      );

      const dataObject = {};
      dataObject["leastSellingprice"] =
        Math.ceil(recommendedPriceRangeLowerLimit) ?? "-";
      dataObject["maxsellingprice"] =
        Math.ceil(recommendedPriceRangeUpperLimit) ?? "-";
      dataObject["actualLSP"] = Math.ceil(leastSellingPrice) ?? "-";

      return dataObject;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = getRecommendedPrice;
