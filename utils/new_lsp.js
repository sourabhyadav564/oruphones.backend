const express = require("express");
// const connection = require("../src/database/mysql_connection");
const fs = require("fs");
const nodemailer = require("nodemailer");
const moment = require("moment");

const dotenv = require("dotenv");
dotenv.config();

const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "eghguoshcuniexbf",
  },
});

var MongoClient = require("mongodb").MongoClient;
var url = process.env.MONGO;

const newMakeAndModal = require("../src/database/modals/others/new_make_and_model");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");

const firstFunction = async () => {
  let foundObjects = [];
  let allModelFound = [];
  let allModelNotFound = [];
  const allgsmData = JSON.parse(fs.readFileSync("gsm_arena_filtered.json"));
  // const fileData = JSON.parse(fs.readFileSync("testing_scrapped_datas.json"));
  const fileData = await testScrappedModal.find({}, { _id: 0 });

  let gsmData = allgsmData.filter((item) => item.models.length >= 0);
  gsmData.forEach((element, index) => {
    let marketingName =
      element.marketingName.charAt(0).toUpperCase() +
      element.marketingName.slice(1);
    if (marketingName.includes("(")) {
      let tempName = marketingName.split("(")[0];
      marketingName = tempName.trim();
    }
    let cond = ["Like New", "Excellent", "Good", "Fair"];
    element.storage.forEach((el) => {
      cond.forEach((con) => {
        let variable = fileData.filter((elm) => {
          let mdl = elm.model_name != null ? elm.model_name.toString() : "";
          if (mdl.includes("(")) {
            let tempName2 = mdl.split("(")[0];
            mdl = tempName2.trim();
          }
          if (mdl.includes("|")) {
            let tempName2 = mdl.split("|")[0];
            mdl = tempName2.trim();
          }
          mdl = mdl.toLowerCase().replace(/5g/g, "").trim();
          marketingName = marketingName.toLowerCase().replace(/5g/g, "").trim();
          // handliing poco in model name //

          mdl = mdl.toLowerCase().replace(/poco/g, "xiaomi poco").trim();

          // handliing poco in model name //
          if (
            mdl.toLowerCase() == marketingName.toLowerCase() &&
            el.includes(elm.storage) &&
            elm.mobiru_condition.includes(con)
          ) {
            return elm;
          } else if (
            mdl.toLowerCase() == marketingName.toLowerCase() &&
            elm.storage == "--" &&
            elm.mobiru_condition.includes(con) &&
            elm.price != null
          ) {
            return elm;
          }
          // else if (
          //   mdl.toLowerCase().includes(marketingName.toLowerCase()) &&
          //   el.includes(elm.storage) &&
          //   el.includes(elm.ram) &&
          //   elm.mobiru_condition.includes(con)
          // ) {
          //   return elm;
          // }
        });
        if (variable) {
          variable = variable.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.model_name === value.model_name &&
                  t.storage === value.storage &&
                  t.ram === value.ram &&
                  t.mobiru_condition === value.mobiru_condition &&
                  t.type === value.type &&
                  t.vendor_id === value.vendor_id
              )
          );

          allModelFound.push(marketingName);
          variable.forEach((elm) => {
            // let elm = variable[0];
            let make = element.make;
            let model = element.marketingName;
            // let model_id = elm.model_id;
            let storage = elm.storage ? `${elm.storage} GB` : "--";
            let ram = elm.ram ? `${elm.ram} GB` : "--";
            let condition = con;
            let tempPrice = elm.price != null ? elm.price.toString() : "";
            if (tempPrice.includes(".")) {
              tempPrice = tempPrice.toString().split(".")[0].toString();
            }
            if (tempPrice.includes(",")) {
              tempPrice = tempPrice.toString().replace(",", "").toString();
            }

            let price = parseInt(tempPrice);
            let type = elm.type;
            let vendor_id = elm.vendor_id;

            let dataObj = {
              make,
              model,
              storage,
              ram,
              condition,
              price,
              type,
              vendor_id,
            };
            foundObjects.push(dataObj);
          });
        } else {
          if (!allModelNotFound.includes("GSM: " + marketingName)) {
            allModelNotFound.push("GSM: " + marketingName);
          }
        }
      });
    });
    console.log({ index });
    if (index == gsmData.length - 1) {
      secondFunction(foundObjects);
    }
  });
};

const secondFunction = (foundObjects) => {
  let commonModels = [];
  foundObjects.forEach((element, index) => {
    let foundIndex = commonModels.findIndex((item) => {
      element.make == item.make &&
        element.model == item.model &&
        element.storage == item.storage &&
        element.ram == item.ram &&
        element.condition == item.condition;
    });
    if (!commonModels[foundIndex]) {
    // if (foundIndex < 0 || !commonModels[foundIndex] || commonModels[foundIndex].length == 0) {
      let tempOject = {
        make: element.make,
        model: element.model,
        storage: element.storage,
        ram: element.ram,
        condition: element.condition,
        vendor: [
          {
            vendor_id: element.vendor_id,
            price: element.price,
            type: element.type,
          },
        ],
      };
      //   tempOject.vendor.push({
      //     vendor_id: element.vendor_id,
      //     price: element.price,
      //     type: element.type,
      //   });
      commonModels.push(tempOject);
    } else {
        commonModels[foundIndex].vendor.push({
        vendor_id: element.vendor_id,
        price: element.price,
        type: element.type,
      });
    }
    if (index == foundObjects.length - 1) {
      fs.writeFileSync(
        "foundObjects2.json",
        JSON.stringify(commonModels, null, 2)
      );
    }
  });
};

const thirdFunction = async (commonModels) => {};

function lspFunction(condition, gotDataFrom, leastSellingPrice) {
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
    if (gotDataFrom === "Like New") {
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

const startCalculatingLSPTest = async () => {
  firstFunction();
};

module.exports = startCalculatingLSPTest;
