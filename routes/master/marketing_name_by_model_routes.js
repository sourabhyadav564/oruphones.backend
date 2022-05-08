const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");
const connection = require("../../src/database/mysql_connection");

router.post("/marketingNameByModel", async (req, res) => {
  const deviceStorage = req.body.deviceStorage;
  const model = req.body.model;
  let make = req.body.make;
  const ram = req.body.ram;

  // let newMake = make.split(" ").map((currentValue) => {
  //   let newText = currentValue[0].toUpperCase() + currentValue.slice(1);
  //   return newText;
  // });

  // make = newMake[0]

  let tempMake = make.toLowerCase();

  switch (tempMake) {
    case "samsung":
      make = "Samsung";
      break;
    case "oneplus":
      make = "OnePlus";
      break;
    case "huawei":
      make = "Huawei";
      break;
    case "xiaomi":
      make = "Xiaomi";
      break;
    case "vivo":
      make = "Vivo";
      break;
    case "oppo":
      make = "Oppo";
      break;
    case "google":
      make = "Google";
      break;
    case "htc":
      make = "HTC";
      break;
    case "lenovo":
      make = "Lenovo";
      break;
    case "apple":
      make = "Apple";
      break;
    case "sony":
      make = "Sony";
      break;
    case "nokia":
      make = "Nokia";
      break;
    case "infinix":
      make = "Infinix";
      break;
    case "acer":
      make = "Acer";
      break;
    case "asus":
      make = "Asus";
      break;
    case "honor":
      make = "Honor";
      break;
    case "microsoft":
      make = "Microsoft";
      break;
    case "lg":
      make = "LG";
      break;
  }

  try {
    // FURTHER: use aggregate to get the data when complex query is needed
    let Object = await gsmarenaModal.aggregate([{ $match: { make: make } }]);

    let modelName = "";
    let makeArray = Object[0][make];
    // Get the model name from the make array based on the model number
    makeArray.forEach((item, index) => {
      let keys = [];
      for (let key in item) {
        if (key !== "_id") keys.push(key);
      }
      keys.forEach((key, i) => {
        let mKeys = [];
        for (let mKey in item[key]["Misc"]) {
          mKeys.push(mKey);
        }
        mKeys.forEach((newKey, j) => {
          if (
            newKey.includes("Models") &&
            item[key]["Misc"]["Models"].includes(model)
          ) {
            modelName = key;
          }
        });
      });
    });

    const image = await getDefaultImage(modelName);

    // getting the recommendedPriceRange start

    let query =
      "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 10 days;select * from `web_scraper_model`;";

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
          const marketingname = modelName;
          const condition = "Good";
          const storage = req.body.deviceStorage.split(" ")[0].toString();
          const hasCharger = true;
          const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
          const hasEarphone = true;
          const isAppleEarphoneIncluded =
            make === "Apple" ? hasEarphone : false;
          const hasOrignalBox = true;
          const isVarified = true;

          console.log("models", 
        make, 
        marketingname,
        condition,
        storage,
        hasCharger,
        isAppleChargerIncluded,
        hasEarphone,
        isAppleEarphoneIncluded,
        hasOrignalBox,
        isVarified
        );

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

          console.log("selectdModels", selectdModels);

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

          // const dataObject = {};
          // dataObject["leastSellingprice"] =
          //   recommendedPriceRangeLowerLimit ?? "-";
          // dataObject["maxsellingprice"] =
          //   recommendedPriceRangeUpperLimit ?? "-";
          
          let dataObject = {
            deviceStorage: deviceStorage,
            marketingName: modelName,
            // imagePath: `https://zenrodeviceimages.s3-us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make
            //   .toString()
            //   .toLowerCase()}/mbr_${modelName.toLowerCase().replace(" ", "_")}.png`,
            imagePath: image,
            price: recommendedPriceRangeUpperLimit,
          };
          if (selectdModels.length) {
            // if (selectdModels.length > 1) {
            //   minPrice = Math.min(...selectdModels);
            //   maxPrice = Math.max(...selectdModels);
            // } else {
            //   minPrice = selectdModels[0];
            //   maxPrice = selectdModels[0];
            // }

            res.status(200).json({
              reason: "Modals found",
              statusCode: 200,
              status: "SUCCESS",
              dataObject,
            });

            // res.status(200).json({
            //   reason: "Models Found Successfully",
            //   statusCode: 200,
            //   status: "SUCCESS",
            //   // marketingname: marketingname,
            //   // minPrice: minPrice,
            //   // maxPrice: maxPrice,
            //   // recommendedPriceRange: `${recommendedPriceRangeLowerLimit} to ${recommendedPriceRangeUpperLimit}`,
            //   dataObject: dataObject,
            // });
          } else {
            res.status(200).json({
              reason: "Models Found Successfully",
              statusCode: 200,
              status: "SUCCESS",
              // marketingname: marketingname,
              // minPrice: "NA",
              // maxPrice: "NA",
              dataObject: dataObject,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }

    //  recommendedPriceRange end

    // let dataObject = {
    //   deviceStorage: deviceStorage,
    //   marketingName: modelName,
    //   // imagePath: `https://zenrodeviceimages.s3-us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make
    //   //   .toString()
    //   //   .toLowerCase()}/mbr_${modelName.toLowerCase().replace(" ", "_")}.png`,
    //   imagePath: image,
    //   price: "20,000",
    // };

    // res.status(200).json({
    //   reason: "Modals found",
    //   statusCode: 200,
    //   status: "SUCCESS",
    //   dataObject,
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/makemodellist", async (req, res) => {
  let dataObject = [];
  let makes = await gsmarenaModal.find({}, { make: 1, _id: 0 });
  let allBrand = [];
  makes.forEach((item) => {
    let currentBrand = Object.values(item)[2].make;
    allBrand.push(currentBrand);
  });

  allBrand.forEach(async (brandName) => {
    // Loop through the makes will be starting from here
    let models = await gsmarenaModal.aggregate([
      { $match: { make: brandName } },
    ]);

    let modelArray = await models[0][brandName];
    let newModels = [];

    modelArray.forEach((item, index) => {
      let marketingname = "";
      let color = [];
      let storage = [];
      let keys = [];
      for (let key in item) {
        if (key !== "_id") keys.push(key);
      }
      keys.forEach((key, i) => {
        marketingname = key;
        let mKeys = [];
        for (let mKey in item[key]["Misc"]) {
          mKeys.push(mKey);
        }

        mKeys.forEach((colorKey, j) => {
          if (colorKey.includes("Colors")) {
            color = item[key]["Misc"]["Colors"].split(", ");
          }
        });

        let memKeys = [];
        for (let memKey in item[key]["Memory"]) {
          memKeys.push(memKey);
        }

        memKeys.forEach((storageKey, j) => {
          if (storageKey.includes("Internal")) {
            let storageArray = item[key]["Memory"]["Internal"].split(", ");
            let intStorage;
            let finalStorageArray = [];
            storageArray.forEach((storageItem) => {
              intStorage = storageItem
                .split(" ")
                .find((item) => item.indexOf("GB"))
                .slice(0, -2);
              // console.log("int", intStorage);
              finalStorageArray.push(intStorage + " GB");
            });
            // storage = item[key]["Memory"]["Internal"].split(", ");
            storage = finalStorageArray;
          }
        });
      });

      newModels.push({
        marketingname,
        color,
        storage,
      });
    });

    dataObject.push({
      make: brandName,
      models: newModels,
    });

    if (allBrand.length === dataObject.length) {
      res.status(200).json({
        reason: "Modals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  });
});

module.exports = router;
