const express = require("express");
const connection = require("../src/database/mysql_connection");

const scrappedModal = require("../src/database/modals/others/scrapped_models");
const smartphoneModal = require("../src/database/modals/others/smartphone_models");
const allMatrix = require("../utils/matrix_figures");

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 10, checkperiod: 120 });

const getRecommendedPrice = async (
  make,
  marketingname,
  condition,
  storage,
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
    let scrappedModels = await scrappedModal.find({
      model_name: marketingname,
      storage: storage,
    });

    let selectdModels = [];
    let itemId = "";

    // let leastSellingPrice;
    // let lowerRangeMatrix = 0.7;
    // let upperRangeMatrix = 0.8;
    // let isAppleCharger = 0.1;
    // let isNonAppleCharger = 0.02;
    // let isAppleEarphone = 0.05;
    // let isNonAppleEarphone = 0.01;
    // let isOriginalBox = 0.01;
    // let warrantyZeroToThree = 0.05;
    // // let warrantyZeroToThree = 0.1;
    // // let warrantyFourToSix = 0.08;
    // // let warrantySevenToTen = 0.05;
    // // let varified = 0.1;
    // let varified = 0.04;

    let leastSellingPrice;
    let lowerRangeMatrix = allMatrix.recommendedPriceFigures.lowerRangeMatrix;
    let upperRangeMatrix = allMatrix.recommendedPriceFigures.upperRangeMatrix;
    let isAppleCharger = allMatrix.recommendedPriceFigures.isAppleCharger;
    let isNonAppleCharger = allMatrix.recommendedPriceFigures.isNonAppleCharger;
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
    if (isVarified) {
      totalPercentageToBeAdd += varified;
    }

    let gotDataFrom = "";
    for (var item of scrappedModels) {
      if (
        item.model_name === marketingname &&
        item.mobiru_condition === condition &&
        item.storage === storage
      ) {
        selectdModels.push(item.price);
        gotDataFrom = condition;
        break;
      }
      if (condition === "Good" && gotDataFrom === "") {
        if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Excellent"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Excellent";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Like New"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Like New";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Fair"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Fair";
          break;
        }
      } else if (condition === "Excellent" && gotDataFrom === "") {
        if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Good"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Good";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Like New"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Like New";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Fair"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Fair";
          break;
        }
      } else if (condition === "Like New" && gotDataFrom === "") {
        if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Good"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Good";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Excellent"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Excellent";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Fair"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Fair";
          break;
        }
      } else if (condition === "Fair" && gotDataFrom === "") {
        if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Good"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Good";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Excellent"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Excellent";
          break;
        } else if (
          item.model_name === marketingname &&
          item.storage === storage &&
          item.mobiru_condition === "Like New"
        ) {
          selectdModels.push(item.price);
          gotDataFrom = "Like New";
          break;
        }
      }
    }

    leastSellingPrice = Math.min(...selectdModels);

    let bool = false;

    console.log("leastSellingPrice first: " + leastSellingPrice);

    if (condition === "Good") {
      if (gotDataFrom === "Good") {
        bool = true;
      } else if (gotDataFrom === "Excellent") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 300;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 700;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 1300;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 1700;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 2500;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 3500;
          bool = true;
        }
      } else if (gotDataFrom === "Like New") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 700;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 1500;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 2500;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 3500;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 5500;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 8000;
          bool = true;
        }
      }
    } else if (condition === "Excellent") {
      if (gotDataFrom === "Excellent") {
        bool = true;
      } else if (gotDataFrom === "Good") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice + 300;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice + 700;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice + 1300;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice + 1700;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice + 2500;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice + 3500;
          bool = true;
        }
      } else if (gotDataFrom === "Like New") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 400;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 800;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 1200;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 2300;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 3000;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 4500;
          bool = true;
        }
      }
    } else if (condition === "Like New") {
      if (gotDataFrom === "Like New") {
        bool = true;
      } else if (gotDataFrom === "Good") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice + 700;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice + 1500;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice + 2500;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice + 3500;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice + 5500;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice + 8000;
          bool = true;
        }
      } else if (gotDataFrom === "Excellent") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice + 400;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice + 800;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice + 1200;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice + 2300;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice + 3000;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice + 4500;
          bool = true;
        }
      }
    } else if (condition === "Fair") {
      if (gotDataFrom === "Good") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 500;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 1500;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 2500;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 3500;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 5500;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 8000;
          bool = true;
        }
      } else if (gotDataFrom === "Excellent") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 1200;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 2300;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 3700;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 4700;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 8000;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 11500;
          bool = true;
        }
      } else if (gotDataFrom === "Like New") {
        if (leastSellingPrice <= 10000) {
          leastSellingPrice = leastSellingPrice - 1500;
          bool = true;
        } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
          leastSellingPrice = leastSellingPrice - 3000;
          bool = true;
        } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
          leastSellingPrice = leastSellingPrice - 5000;
          bool = true;
        } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
          leastSellingPrice = leastSellingPrice - 7000;
          bool = true;
        } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
          leastSellingPrice = leastSellingPrice - 11000;
          bool = true;
        } else if (leastSellingPrice > 70000) {
          leastSellingPrice = leastSellingPrice - 16000;
          bool = true;
        }
      }
    }

    let recommendedPriceRangeLowerLimit = lowerRangeMatrix * leastSellingPrice;
    let recommendedPriceRangeUpperLimit = upperRangeMatrix * leastSellingPrice;

    recommendedPriceRangeLowerLimit = Math.ceil(
      recommendedPriceRangeLowerLimit +
        (recommendedPriceRangeLowerLimit * totalPercentageToBeAdd) / 100
    );

    recommendedPriceRangeUpperLimit = Math.ceil(
      recommendedPriceRangeUpperLimit +
        (recommendedPriceRangeUpperLimit * totalPercentageToBeAdd) / 100
    );

    // if (isForMarketingName) {
    //   if (isAppleEarphoneIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix +
    //         isAppleEarphone +
    //         isOriginalBox +
    //         isAppleCharger +
    //         varified +
    //         warrantyZeroToThree) *
    //       leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix +
    //         isAppleEarphone +
    //         isOriginalBox +
    //         isAppleCharger +
    //         varified +
    //         warrantyZeroToThree) *
    //       leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix +
    //         isNonAppleEarphone +
    //         isOriginalBox +
    //         isNonAppleCharger +
    //         varified +
    //         warrantyZeroToThree) *
    //       leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix +
    //         isNonAppleEarphone +
    //         isOriginalBox +
    //         isNonAppleCharger +
    //         varified +
    //         warrantyZeroToThree) *
    //       leastSellingPrice;
    //   }
    // } else if (hasCharger && hasEarphone && hasOrignalBox) {
    //   if (isAppleEarphoneIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix +
    //         isAppleEarphone +
    //         isOriginalBox +
    //         isAppleCharger) *
    //       leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix +
    //         isAppleEarphone +
    //         isOriginalBox +
    //         isAppleCharger) *
    //       leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix +
    //         isNonAppleEarphone +
    //         isOriginalBox +
    //         isNonAppleCharger) *
    //       leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix +
    //         isNonAppleEarphone +
    //         isOriginalBox +
    //         isNonAppleCharger) *
    //       leastSellingPrice;
    //   }
    // } else if (hasCharger && hasEarphone) {
    //   if (isAppleChargerIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isAppleCharger + isAppleEarphone) *
    //       leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isAppleCharger + isAppleEarphone) *
    //       leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
    //       leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
    //       leastSellingPrice;
    //   }
    // } else if (hasCharger && hasOrignalBox) {
    //   if (isAppleChargerIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isAppleCharger + isOriginalBox) *
    //       leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isAppleCharger + isOriginalBox) *
    //       leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isNonAppleCharger + isOriginalBox) *
    //       leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isNonAppleCharger + isOriginalBox) *
    //       leastSellingPrice;
    //   }
    // } else if (hasEarphone && hasOrignalBox) {
    //   if (isAppleEarphoneIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isAppleEarphone + isOriginalBox) *
    //       leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isAppleEarphone + isOriginalBox) *
    //       leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isNonAppleEarphone + isOriginalBox) *
    //       leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isNonAppleEarphone + isOriginalBox) *
    //       leastSellingPrice;
    //   }
    // } else if (hasCharger) {
    //   if (isAppleChargerIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isAppleCharger) * leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isAppleCharger) * leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isNonAppleCharger) * leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isNonAppleCharger) * leastSellingPrice;
    //   }
    // } else if (hasEarphone) {
    //   if (isAppleEarphoneIncluded) {
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isAppleEarphone) * leastSellingPrice;
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isAppleEarphone) * leastSellingPrice;
    //   } else {
    //     recommendedPriceRangeLowerLimit =
    //       (lowerRangeMatrix + isNonAppleEarphone) * leastSellingPrice;
    //     recommendedPriceRangeUpperLimit =
    //       (upperRangeMatrix + isNonAppleEarphone) * leastSellingPrice;
    //   }
    // } else if (hasOrignalBox) {
    //   recommendedPriceRangeUpperLimit =
    //     (upperRangeMatrix + isOriginalBox) * leastSellingPrice;
    //   recommendedPriceRangeLowerLimit =
    //     (lowerRangeMatrix + isOriginalBox) * leastSellingPrice;
    // }

    const dataObject = {};
    dataObject["leastSellingprice"] =
      Math.ceil(recommendedPriceRangeLowerLimit) ?? "-";
    dataObject["maxsellingprice"] =
      Math.ceil(recommendedPriceRangeUpperLimit) ?? "-";
    dataObject["actualLSP"] = Math.ceil(leastSellingPrice) ?? "-";

    return dataObject;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getRecommendedPrice;
