const express = require("express");
const lspModal = require("../../src/database/modals/others/new_scrapped_models");
const router = express.Router();

require("../../src/database/connection");
const scrappedModal = require("../../src/database/modals/others/scrapped_models");
const testScrappedModal = require("../../src/database/modals/others/test_scrapped_models");
const logEvent = require("../../src/middleware/event_logging");
const allMatrix = require("../../utils/matrix_figures");
const fs = require("fs");
const validUser = require("../../src/middleware/valid_user");

router.post(
  "/price/externalsellsource",
  validUser,
  logEvent,
  async (req, res) => {
    const deviceStorage = req.body.deviceStorage.split("GB")[0];
    let deviceRam =
      req.body.deviceRam == "--"
        ? req.body.deviceRam
        : req.body.deviceRam.split("GB")[0];
    let make = req.body.make;
    let marketingName = req.body.marketingName;
    const deviceCondition = req.body.deviceCondition;
    const hasCharger = req.body.hasCharger;
    const hasEarphone = req.body.hasEarphone;
    const hasOriginalBox = req.body.hasOriginalBox;
    let warrantyPeriod = req.body.warrantyPeriod;

    let chargerPercentage =
      allMatrix.externalSellSourceFigures.chargerPercentage;
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

    try {
      if (deviceCondition == "Needs Repair") {
        return res.status(200).json({
          reason: "Listing not found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: [],
        });
      } else {
        marketingName = marketingName.replace("+", " Plus");
        const listings = await testScrappedModal.find({
          type: "sell",
          storage: [
            parseInt(deviceStorage),
            "--",
            "-- GB",
            `${parseInt(deviceStorage)} GB`,
          ],
          ram: [
            parseInt(deviceRam),
            "--",
            "-- GB",
            `${parseInt(deviceRam)} GB`,
          ],
          make: make,
          // model_name: [marketingName, exact_model_name, tempModelName],
          model_name: {
            $regex: new RegExp("^" + marketingName.toLowerCase() + "$", "i"),
          },
          // model_name: { $regex: marketingName.toString(), $options: "i" },
          // TODO: compare modelname with lowercase using expr
          // $expr: {
          //   $or: [
          //     { $eq: ["$model_name", marketingName] },
          //     { $eq: ["$model_name", marketingName.toLowerCase()] },
          //   ],
          // },
          mobiru_condition: [deviceCondition, "Like New"],
        });

        if (!listings || listings.length == 0) {
          return res.status(200).json({
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
                condition: element.mobiru_condition,
              });
            }
          });

          vendorListings.forEach(async (element, index) => {
            let filterData = {};
            let vendorName = VENDORS[element.vendor_id];
            let finalPrice;
            if (element.vendor_id != 6 && element.vendor_id != 23) {
              finalPrice =
                element.price != null
                  ? element.price -
                    (element.price * totalPercentageToBeReduced) / 100
                  : 0;
              finalPrice = Math.ceil(finalPrice);
              finalPrice = await lspFunction(
                deviceCondition,
                element.condition,
                finalPrice
              );
            } else {
              finalPrice = element.price;
              finalPrice = Math.ceil(finalPrice);
              finalPrice = await lspFunction(
                deviceCondition,
                deviceCondition,
                finalPrice
              );
            }

            let vendorImage = `https://d1tl44nezj10jx.cloudfront.net/devImg/vendors/${vendorName
              .toString()
              .toLowerCase()}_logo.png`;
            filterData["externalSourcePrice"] =
              element.price != null ? finalPrice.toString() : "";
            filterData["externalSourceImage"] = vendorImage;
            finalDataArray.push(filterData);

            if (index === vendorListings.length - 1) {
              finalDataArray.filter((element) => {
                if (element.price === "") {
                  finalDataArray.splice(finalDataArray.indexOf(element), 1);
                }
              });

              finalDataArray.sort((a, b) => {
                return (
                  parseInt(a.externalSourcePrice) -
                  parseInt(b.externalSourcePrice)
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
              return res.status(200).json({
                reason: "External Sell Source found",
                statusCode: 200,
                status: "SUCCESS",
                dataObject: dataToBeSend,
              });
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

function lspFunction(condition, gotDataFrom, leastSellingPrice) {
  // LSP function returns lsp using another condition
  if (condition === "Good") {
    if (gotDataFrom === "Good") {
      return leastSellingPrice;
    } else if (gotDataFrom === "Like New") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 1500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 2500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 3500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 5500;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 8000;
        return leastSellingPrice;
      }
    } else if (gotDataFrom === "Excellent") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 1300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 1700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 2500;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 3500;
        return leastSellingPrice;
      }
    }
  } else if (condition === "Excellent") {
    if (gotDataFrom === "Excellent") {
      return leastSellingPrice;
    } else if (gotDataFrom === "Like New") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 400;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 800;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 1200;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 2300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 3000;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 4500;
        return leastSellingPrice;
      }
    } else if (gotDataFrom === "Good") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice + 300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice + 700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice + 1300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice + 1700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice + 2500;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice + 3500;
        return leastSellingPrice;
      }
    }
  } else if (condition === "Like New") {
    if (gotDataFrom === "Like New") {
      return leastSellingPrice;
    } else if (gotDataFrom === "Excellent") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice + 400;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice + 800;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice + 1200;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice + 2300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice + 3000;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice + 4500;
        return leastSellingPrice;
      }
    } else if (gotDataFrom === "Good") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice + 700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice + 1500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice + 2500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice + 3500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice + 5500;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice + 8000;
        return leastSellingPrice;
      }
    }
  } else if (condition === "Fair") {
    if (gotDataFrom === "Fair") {
      return leastSellingPrice;
    } else if (gotDataFrom === "Like New") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 1500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 3000;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 5000;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 7000;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 11000;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 16000;
        return leastSellingPrice;
      }
    } else if (gotDataFrom === "Excellent") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 1200;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 2300;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 3700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 4700;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 8000;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 11500;
        return leastSellingPrice;
      }
    } else if (gotDataFrom === "Good") {
      if (leastSellingPrice <= 10000) {
        leastSellingPrice = leastSellingPrice - 500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 20000 && leastSellingPrice > 10000) {
        leastSellingPrice = leastSellingPrice - 1500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 30000 && leastSellingPrice > 20000) {
        leastSellingPrice = leastSellingPrice - 2500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 50000 && leastSellingPrice > 30000) {
        leastSellingPrice = leastSellingPrice - 3500;
        return leastSellingPrice;
      } else if (leastSellingPrice <= 70000 && leastSellingPrice > 50000) {
        leastSellingPrice = leastSellingPrice - 5500;
        return leastSellingPrice;
      } else if (leastSellingPrice > 70000) {
        leastSellingPrice = leastSellingPrice - 8000;
        return leastSellingPrice;
      }
    }
  }
}

module.exports = router;
