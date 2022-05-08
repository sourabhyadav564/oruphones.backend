const express = require("express");
const connection = require("../src/database/mysql_connection");

const getRecommendedPrice = async (make, marketingname, condition, storage, hasCharger, isAppleChargerIncluded, hasEarphone, isAppleEarphoneIncluded, hasOrignalBox, isVarified) => {
  let query =
    "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 72 hour;select * from `web_scraper_model`;";

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
        21: "Buyblynk",
        22: "Electronicbazaar",
      };

      try {
        // connection.query(query1, (err, scrappedModels, fields) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         // console.log(scrappedModels);
        //         res.status(200).json({
        //             reason: "Scrapped Models Found Successfully",
        //             statusCode: 200,
        //             status: "SUCCESS",
        //             scrappedModels
        //           });
        //     }
        // })
    
        // connection.query(query2, (err, Models, fields) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         // console.log(Models);
        //         res.status(200).json({
        //             reason: "Models Found Successfully",
        //             statusCode: 200,
        //             status: "SUCCESS",
        //             Models
        //           });
        //     }
        // })
    
        connection.query(query, [2, 1], (err, results, fields) => {
          if (err) {
            console.log(err);
          } else {
            let models = results[1];
            let scrappedModels = results[0];
            let selectdModels = [];
            // let minPrice;
            // let maxPrice;
            let itemId = "";
            // let make = "OnePlus";
            // let marketingname = "OnePlus 7";
            // let condition = "Excellent";
            // let storage = "128";
            // const make = req.body.make;
            // const marketingname = req.body.marketingName;
            // const condition = req.body.deviceCondition;
            // const storage = req.body.devicestorage.split(" ")[0].toString();
            // const hasCharger = req.body.charger === "Y" ? true : false;
            // const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
            // const hasEarphone = req.body.earPhones === "Y" ? true : false;
            // const isAppleEarphoneIncluded = make === "Apple" ? hasEarphone : false;
            // const hasOrignalBox = req.body.originalBox === "Y" ? true : false;
            // const isVarified = req.body.verified === "no" ? false : true;
    
            let leastSellingPrice;
            let lowerRangeMatrix = 0.7;
            let upperRangeMatrix = 0.9;
            let isAppleCharger = 0.1;
            let isNonAppleCharger = 0.05;
            let isAppleEarphone = 0.1;
            let isNonAppleEarphone = 0.05;
            let isOriginalBox = 0.03;
    
            models.forEach((item, index) => {
              if (item.name === marketingname) {
                itemId = item.id;
                return;
              }
            });
    
            let gotDataFrom = "";
    
            // scrappedModels.forEach((item, index) => {
            for (var item of scrappedModels) {
              if (
                item.model_id === itemId &&
                item.mobiru_condition === condition &&
                item.storage === parseInt(storage)
              ) {
                selectdModels.push(item.price);
                gotDataFrom = condition;
                break;
              }
              if (condition === "Good" && gotDataFrom === "") {
                if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Excellent"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Excellent";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Like New"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Like New";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Fair"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Fair";
                  break;
                }
              } else if (condition === "Excellent" && gotDataFrom === "") {
                if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Good"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Good";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Like New"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Like New";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Fair"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Fair";
                  break;
                }
              } else if (condition === "Like New" && gotDataFrom === "") {
                if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Good"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Good";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Excellent"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Excellent";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Fair"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Fair";
                  break;
                }
              } else if (condition === "Fair" && gotDataFrom === "") {
                if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Good"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Good";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
                  item.mobiru_condition === "Excellent"
                ) {
                  selectdModels.push(item.price);
                  gotDataFrom = "Excellent";
                  break;
                } else if (
                  item.model_id === itemId &&
                  item.storage === parseInt(storage) &&
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
                return;
              } else if (gotDataFrom === "Excellent") {
                if (leastSellingPrice <= 10000) {
                  leastSellingPrice = leastSellingPrice - 300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 1300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 1700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 1500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 2500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 3500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
                  leastSellingPrice = leastSellingPrice - 5500;
                  bool = true;
                } else if (leastSellingPrice > 70000) {
                  leastSellingPrice = leastSellingPrice - 8000;
                  bool = true;
                }
              }
            } else if (condition === "Excellent") {
              if (gotDataFrom === "Excellent") {
                return;
              } else if (gotDataFrom === "Good") {
                if (leastSellingPrice <= 10000) {
                  leastSellingPrice = leastSellingPrice + 300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice + 700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice + 1300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice + 1700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 800;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 1200;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 2300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
                  leastSellingPrice = leastSellingPrice - 3000;
                  bool = true;
                } else if (leastSellingPrice > 70000) {
                  leastSellingPrice = leastSellingPrice - 4500;
                  bool = true;
                }
              }
            } else if (condition === "Like New") {
              if (gotDataFrom === "Like New") {
                return;
              } else if (gotDataFrom === "Good") {
                if (leastSellingPrice <= 10000) {
                  leastSellingPrice = leastSellingPrice + 700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice + 1500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice + 2500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice + 3500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice + 800;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice + 1200;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice + 2300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 1500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 2500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 3500;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 2300;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 3700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 4700;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
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
                } else if (
                  leastSellingPrice <= 20000 &&
                  leastSellingPrice > 10000
                ) {
                  leastSellingPrice = leastSellingPrice - 3000;
                  bool = true;
                } else if (
                  leastSellingPrice <= 30000 &&
                  leastSellingPrice > 20000
                ) {
                  leastSellingPrice = leastSellingPrice - 5000;
                  bool = true;
                } else if (
                  leastSellingPrice <= 50000 &&
                  leastSellingPrice > 30000
                ) {
                  leastSellingPrice = leastSellingPrice - 7000;
                  bool = true;
                } else if (
                  leastSellingPrice <= 70000 &&
                  leastSellingPrice > 50000
                ) {
                  leastSellingPrice = leastSellingPrice - 11000;
                  bool = true;
                } else if (leastSellingPrice > 70000) {
                  leastSellingPrice = leastSellingPrice - 16000;
                  bool = true;
                }
              }
            }
    
            // if (bool) {
            // console.log("leastSellingPrice: " + leastSellingPrice);
            // console.log("gotDataFrom: " + gotDataFrom);
            // }
    
            // let recommendedPriceRange = `${0.7 * Math.max(...selectdModels)} to ${
            //   0.9 * Math.max(...selectdModels)
            // }`;
    
            let recommendedPriceRangeLowerLimit = Math.ceil(
              lowerRangeMatrix * leastSellingPrice
            );
            let recommendedPriceRangeUpperLimit = Math.ceil(
              upperRangeMatrix * leastSellingPrice
            );
    
            if (hasCharger && hasEarphone && hasOrignalBox) {
              if (isAppleEarphoneIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix +
                    isAppleEarphone +
                    isOriginalBox +
                    isAppleCharger) *
                    leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix +
                    isAppleEarphone +
                    isOriginalBox +
                    isAppleCharger) *
                    leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix +
                    isNonAppleEarphone +
                    isOriginalBox +
                    isNonAppleCharger) *
                    leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix +
                    isNonAppleEarphone +
                    isOriginalBox +
                    isNonAppleCharger) *
                    leastSellingPrice
                );
              }
            } else if (hasCharger && hasEarphone) {
              if (isAppleChargerIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isAppleCharger + isAppleEarphone) *
                    leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isAppleCharger + isAppleEarphone) *
                    leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
                    leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
                    leastSellingPrice
                );
              }
            } else if (hasCharger && hasOrignalBox) {
              if (isAppleChargerIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isAppleCharger + isOriginalBox) *
                    leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isAppleCharger + isOriginalBox) *
                    leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isNonAppleCharger + isOriginalBox) *
                    leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isNonAppleCharger + isOriginalBox) *
                    leastSellingPrice
                );
              }
            } else if (hasEarphone && hasOrignalBox) {
              if (isAppleEarphoneIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isAppleEarphone + isOriginalBox) *
                    leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isAppleEarphone + isOriginalBox) *
                    leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isNonAppleEarphone + isOriginalBox) *
                    leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isNonAppleEarphone + isOriginalBox) *
                    leastSellingPrice
                );
              }
            } else if (hasCharger) {
              if (isAppleChargerIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isAppleCharger) * leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isAppleCharger) * leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isNonAppleCharger) * leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isNonAppleCharger) * leastSellingPrice
                );
              }
            } else if (hasEarphone) {
              if (isAppleEarphoneIncluded) {
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isAppleEarphone) * leastSellingPrice
                );
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isAppleEarphone) * leastSellingPrice
                );
              } else {
                recommendedPriceRangeLowerLimit = Math.ceil(
                  (lowerRangeMatrix + isNonAppleEarphone) * leastSellingPrice
                );
                recommendedPriceRangeUpperLimit = Math.ceil(
                  (upperRangeMatrix + isNonAppleEarphone) * leastSellingPrice
                );
              }
            } else if (hasOrignalBox) {
              recommendedPriceRangeUpperLimit = Math.ceil(
                (upperRangeMatrix + isOriginalBox) * leastSellingPrice
              );
              recommendedPriceRangeLowerLimit = Math.ceil(
                (lowerRangeMatrix + isOriginalBox) * leastSellingPrice
              );
            }
            
            const dataObject = {};
            dataObject["leastSellingprice"] =
              recommendedPriceRangeLowerLimit ?? "-";
            dataObject["maxsellingprice"] = recommendedPriceRangeUpperLimit ?? "-";
    
            // if (selectdModels.length) {
              // if (selectdModels.length > 1) {
              //   minPrice = Math.min(...selectdModels);
              //   maxPrice = Math.max(...selectdModels);
              // } else {
              //   minPrice = selectdModels[0];
              //   maxPrice = selectdModels[0];
              // }
            //   res.status(200).json({
            //     reason: "Models Found Successfully",
            //     statusCode: 200,
            //     status: "SUCCESS",
            //     // marketingname: marketingname,
            //     // minPrice: minPrice,
            //     // maxPrice: maxPrice,
            //     // recommendedPriceRange: `${recommendedPriceRangeLowerLimit} to ${recommendedPriceRangeUpperLimit}`,
            //     dataObject: dataObject,
            //   });
            // } else {
            //   res.status(200).json({
            //     reason: "No Result Available",
            //     statusCode: 200,
            //     status: "SUCCESS",
            //     // marketingname: marketingname,
            //     // minPrice: "NA",
            //     // maxPrice: "NA",
            //     dataObject: dataObject,
            //   });
            // }
            return dataObject;
          }
        });
      } catch (error) {
        console.log(error);
        // res.status(500).json(error);
      }
};

module.exports = getRecommendedPrice;
