const express = require("express");
const connection = require("../src/database/mysql_connection");
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

// require("../../src/database/connection");
const scrappedModal = require("../src/database/modals/others/scrapped_models");
// const smartphoneModal = require("../../src/database/modals/others/smartphone_models");
const lspModal = require("../src/database/modals/others/new_scrapped_models");
const newMakeAndModal = require("../src/database/modals/others/new_make_and_model");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");

let lspArray = [];
let finalScrappedModelObject = [];
let currentDate = new Date();
let dateFormat = moment(currentDate).add(10, "days").calendar();

const allCronJobs = (allgsmData, fileData) => {
  let foundObjects = [];
  let allModelFound = [];
  let allModelNotFound = [];

  let gsmData = allgsmData.filter((item) => item.models.length > 1);
  gsmData.forEach((element, index) => {
    let marketingName =
      element.marketingName.charAt(0).toUpperCase() +
      element.marketingName.slice(1);
    let cond = ["Like New", "Excellent", "Good", "Fair"];
    element.storage.forEach((el) => {
      cond.forEach((con) => {
        let variable = fileData.filter((elm) => {
          let mdl = elm.model_name != null ? elm.model_name.toString() : "";
          if (mdl.includes("(")) {
            let tempName = mdl.split("(")[0];
            mdl = tempName.trim();
          }
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
          } else if (
            mdl.toLowerCase().includes(marketingName.toLowerCase()) &&
            el.includes(elm.storage) &&
            el.includes(elm.ram) &&
            elm.mobiru_condition.includes(con) &&
            elm.price != null
          ) {
            return elm;
          }
        });
        if (variable) {
          variable = variable.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.model_name == value.model_name &&
                  t.storage == value.storage &&
                  t.ram == value.ram &&
                  t.mobiru_condition == value.mobiru_condition &&
                  t.type == value.type &&
                  t.vendor_id == value.vendor_id
              )
          );

          // allModelFound.push(marketingName);
          variable.forEach((elm) => {
            let make = element.make;
            let model = element.marketingName;
            let model_id = elm.model_id;
            let storage = elm.storage ? `${elm.storage} GB` : "--";
            let ram = elm.ram ? `${elm.ram} GB` : "--";
            let condition = con;
            let price = parseInt(elm.price.toString());
            let type = elm.type;
            let vendor_id = elm.vendor_id;
            let link = elm.link;
            let warranty = elm.warranty;

            let dataObj = {
              make,
              model,
              model_id,
              storage,
              ram,
              condition,
              price,
              type,
              vendor_id,
              link,
              warranty,
            };
            foundObjects.push(dataObj);
          });
        } else {
          // if (!allModelNotFound.includes("GSM: " + marketingName)) {
          //   allModelNotFound.push("GSM: " + marketingName);
          // }
        }
      });
    });

    if (index == gsmData.length - 1) {
      let finalData = [];
      gsmData.forEach((element2, index2) => {
        let types = ["buy", "sell"];
        element2.storage.forEach((str) => {
          let newArray = foundObjects.filter(function (obj) {
            let mdl =
              element2.marketingName != null
                ? element2.marketingName.toString()
                : "";
            if (mdl.includes("(")) {
              let tempName = mdl.split("(")[0];
              mdl = tempName.trim();
            }
            return (
              obj.make.toLowerCase() == element2.make.toLowerCase() &&
              obj.model.toLowerCase() == mdl.toLowerCase() &&
              str.includes(obj.storage) &&
              str.includes(obj.ram.charAt(0))
            );
          });
          if (newArray.length > 0) {
            let conditions = ["Like New", "Excellent", "Good", "Fair"];
            conditions.forEach((con2) => {
              const obj2 = newArray.filter((obj2) =>
                obj2.condition.includes(con2)
              );
              let obj = obj2[0];
              if (obj) {
                let vendorObj = {
                  price: obj.price,
                  type: obj.type,
                  vendor_id: obj.vendor_id,
                  // link: obj.link,
                  // warranty: obj.warranty,
                };
                let dataObject2 = {
                  make: element2.make,
                  model: element2.marketingName,
                  storage: obj.storage,
                  ram: obj.ram,
                  condition: con2,
                };
                const foundInFinalData = finalData.find(
                  (elm) =>
                    elm.model == element2.marketingName &&
                    elm.storage == obj.storage &&
                    elm.condition == con2 &&
                    elm.ram == obj.ram
                );
                if (foundInFinalData) {
                  finalData.splice(finalData.indexOf(foundInFinalData), 1);
                  foundInFinalData.vendor.splice(
                    foundInFinalData.vendor.indexOf(vendorObj),
                    1
                  );
                  foundInFinalData.vendor.push(vendorObj);
                  foundInFinalData.lsp =
                    foundInFinalData.lsp < obj.price
                      ? foundInFinalData.lsp
                      : obj.price;
                  foundInFinalData.isDerived = false;
                  foundInFinalData.type =
                    foundInFinalData.lsp < obj.price
                      ? foundInFinalData.type
                      : obj.type;
                  finalData.push(foundInFinalData);
                } else {
                  dataObject2.vendor = [];
                  dataObject2.vendor.push(vendorObj);
                  dataObject2.lsp = obj.price;
                  dataObject2.isDerived = false;

                  dataObject2.type = obj.type;
                  finalData.push(dataObject2);
                }
              } else {
                let derivedPrice = lsp(
                  con2,
                  newArray[0].condition,
                  newArray[0].price
                );
                let obj = newArray[0];
                let vendorObj = {
                  price: derivedPrice,
                  type: obj.type,
                  vendor_id: obj.vendor_id,
                  // link: obj.link,
                  // warranty: obj.warranty,
                };
                let dataObject2 = {
                  make: element2.make,
                  model: element2.marketingName,
                  storage: obj.storage,
                  ram: obj.ram,
                  condition: con2,
                };
                const foundInFinalData = finalData.find(
                  (elm) =>
                    elm.model == element2.marketingName &&
                    elm.storage == obj.storage &&
                    elm.condition == con2 &&
                    elm.ram == obj.ram
                );
                if (foundInFinalData) {
                  finalData.splice(finalData.indexOf(foundInFinalData), 1);
                  foundInFinalData.vendor.splice(
                    foundInFinalData.vendor.indexOf(vendorObj),
                    1
                  );
                  foundInFinalData.vendor.push(vendorObj);
                  foundInFinalData.lsp =
                    foundInFinalData.lsp < derivedPrice
                      ? foundInFinalData.lsp
                      : derivedPrice;
                  foundInFinalData.isDerived = true;
                  foundInFinalData.type =
                    foundInFinalData.lsp < derivedPrice
                      ? foundInFinalData.type
                      : obj.type;
                  finalData.push(foundInFinalData);
                } else {
                  dataObject2.vendor = [];
                  dataObject2.vendor.push(vendorObj);
                  dataObject2.lsp = obj.price;
                  dataObject2.isDerived = true;

                  dataObject2.type = obj.type;
                  finalData.push(dataObject2);
                }
              }
            });
          }
          // });
        });
        if (index2 == gsmData.length - 1) {
          finalData = finalData.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.make == value.make &&
                  t.model == value.model &&
                  t.storage == value.storage &&
                  t.ram == value.ram &&
                  t.condition == value.condition &&
                  t.lsp == value.lsp &&
                  t.type == value.type &&
                  t.isDerived == value.isDerived
              )
          );
        }
      });
      // fs.writeFileSync("lspData.json", JSON.stringify(finalData, null, 2));
      collectData(finalData);
    }
  });
};

const collectData = async (data) => {
  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("testing_application_data");
      dbo
        .collection("complete_lsp_datas")
        .deleteMany({})
        .then(() => {
          dbo
            .collection("complete_lsp_datas")
            .insertMany(data, function (err, res) {
              if (err) throw err;
              console.log(
                `${data.length} documents inserted successfully on ${dateFormat})}`
              );
              db.close();
            });
        });
    });

    let mailOptions = {
      from: "mobiruindia22@gmail.com",
      // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, anish@zenro.co.jp",
      to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, anish@zenro.co.jp",
      subject: "Data has successfully been migrated to MongoDB",
      text:
        "Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of scrapped models are: " +
        data.length + ". The data is not ready to use for other business logics",
    };

    config.sendMail(mailOptions, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + result.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

function lsp(condition, gotDataFrom, leastSellingPrice) {
  if (condition === "Good") {
    if (gotDataFrom === "Good") {
      return leastSellingPrice;
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
    }
  } else if (condition === "Excellent") {
    if (gotDataFrom === "Excellent") {
      return leastSellingPrice;
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
    }
  } else if (condition === "Like New") {
    if (gotDataFrom === "Like New") {
      return leastSellingPrice;
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
    }
  } else if (condition === "Fair") {
    if (gotDataFrom === "Good") {
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
    }
  }
}

const allCron = async () => {
  console.log("Function Initialized");
  const allgsmData = await newMakeAndModal.find(
    { models: { $exists: true, $ne: [] } },
    { _id: 0 }
  );
  const fileData = await testScrappedModal.find({}, { _id: 0 });
  allCronJobs(allgsmData, fileData);
};

module.exports = allCron;
