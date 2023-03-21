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
    pass: "rtrmntzuzwzisajb",
  },
});

var MongoClient = require("mongodb").MongoClient;
var url = process.env.MONGO;

let currentDate = new Date();
let dateFormat = moment(currentDate).calendar();

const newMakeAndModal = require("../src/database/modals/others/new_make_and_model");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");
// const fileData = JSON.parse(fs.readFileSync("testing_scrapped_datas.json"));
let fileData = [];

const collectData = async (data, collection) => {
  sendMailWithAttachment("Collecting data");
  let mailOptions = {
    from: "mobiruindia22@gmail.com",
    // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
    to: "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp",
    subject: "Data has successfully been migrated to MongoDB",
    text:
      "Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of scrapped models are: " +
      data.length +
      ".",
  };
  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(process.env.Collection);
      dbo
        .collection(collection)
        .deleteMany({})
        .then(() => {
          dbo.collection(collection).insertMany(data, function (err, res) {
            if (err) {
              mailOptions["subject"] = "Error in migrating data to MongoDB";
              throw err;
            }
            console.log(
              `${data.length} documents inserted successfully in ${collection} on ${dateFormat})}`
            );
            db.close();
            config.sendMail(mailOptions, function (err, result) {
              if (err) {
                console.log(err);
              } else {
                // console.log("Email sent: " + result.response);
              }
            });
          });
        });
    });
  } catch (error) {
    // console.log(error);
    mailOptions["subject"] = "Error in LSP : migrating data to MongoDB";
    mailOptions["text"] = error.toString();
    config.sendMail(mailOptions, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        // console.log("Email sent: " + result.response);
      }
    });
  }
};

const sendMailWithAttachment = async (message) => {
  try {
    let mailOptions = {
      from: "mobiruindia22@gmail.com",
      // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
      to: "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp",
      subject: "Lsp runtime log",
      text: message,
      // message === "lspMismatch"
      //   ? "Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of miss matched models are attatched below."
      //   : "Scrapped data has been successfully migrated to MongoDB in the master LSP table and the number of models not founds are attatched below.",
      // attachments: [
      //   {
      //     filename: file,
      //     path: `../${message}.json`,
      //   },
      // ],
    };

    if (process.env.SERVER_URL == "https://oruphones.com") {
      config.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + result.response);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

let allModelNotFound = [];
const firstFunction = async () => {
  sendMailWithAttachment("First function started");
  fileData = await testScrappedModal.find({}, { _id: 0 });
  // Map all data with GSM arena data sets
  let foundObjects = [];
  let allModelFound = [];
  const allgsmData = JSON.parse(fs.readFileSync("gsm_arena_filtered.json"));
  // const fileData = await testScrappedModal.find({}, { _id: 0 });

  let gsmData = allgsmData.filter((item) => item.models.length >= 0);
  //  && item.marketingName.includes("Samsung Galaxy S9+")
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

          // handling spaces in model name
          mdl = mdl.toLowerCase().replace(/ /g, "").trim();
          marketingName = marketingName.toLowerCase().replace(/ /g, "").trim();

          // handling moto & motorola in model name
          mdl = mdl
            .toLowerCase()
            .replace(/motorola moto/g, "motorola")
            .trim();
          mdl = mdl.toLowerCase().replace(/moto /g, "motorola ").trim();

          marketingName = marketingName
            .toLowerCase()
            .replace(/motorola moto/g, "motorola")
            .trim();
          marketingName = marketingName
            .toLowerCase()
            .replace(/moto /g, "motorola ")
            .trim();

          // handling + for plus in model name
          mdl = mdl.toLowerCase().replace(/\+/g, "plus").trim();
          marketingName = marketingName
            .toLowerCase()
            .replace(/\+/g, "plus")
            .trim();

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
        if (variable.length > 0) {
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
            let storage = elm.storage
              ? elm.storage.toString().includes("GB")
                ? elm.storage
                : `${elm.storage} GB`
              : "--";
            let ram = elm.ram
              ? elm.ram.toString().includes("GB")
                ? elm.ram
                : `${elm.ram} GB`
              : "--";
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
          // console.log("marketingName: " +marketingName);
          if (!allModelNotFound.includes("GSM: " + element.marketingName)) {
            allModelNotFound.push("GSM: " + element.marketingName);
          }
        }
      });
    });
    console.log({ index });
    if (index == gsmData.length - 1) {
      // fs.writeFileSync(
      //   "allModelNotFound.json",
      //   JSON.stringify(allModelNotFound, null, 2)
      // );
      secondFunction(foundObjects);
    }
  });
};

const secondFunction = (foundObjects) => {
  sendMailWithAttachment("Second Function Started");
  // Merge all common objects into one
  let commonModels = [];
  foundObjects.forEach((element, index) => {
    let foundIndex = commonModels.findIndex(
      (item) =>
        item.make == element.make &&
        item.model == element.model &&
        item.storage == element.storage &&
        item.ram == element.ram &&
        item.condition == element.condition
    );
    console.log("foundIndex", foundIndex);
    if (!commonModels[foundIndex]) {
      // if (foundIndex < 0 || !commonModels[foundIndex] || commonModels[foundIndex].length == 0) {
      let tempOject = {
        make: element.make,
        model: element.model,
        storage: element.storage,
        ram: element.ram,
        condition: element.condition,
        priceArray: [],
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
      let itm = {
        vendor_id: element.vendor_id,
        price: element.price,
        type: element.type,
      };

      if (commonModels[foundIndex].vendor.indexOf(itm) == -1) {
        commonModels[foundIndex].vendor.push(itm);
      }
      // commonModels[foundIndex].vendor.push({
      //   vendor_id: element.vendor_id,
      //   price: element.price,
      //   type: element.type,
      // });
    }
    if (index == foundObjects.length - 1) {
      thirdFunction(commonModels);
      // fs.writeFileSync(
      //   "foundObjects2.json",
      //   JSON.stringify(commonModels, null, 2)
      // );
    }
  });
};

const thirdFunction = async (commonModels) => {
  // find all possible LSPs and put into an array
  sendMailWithAttachment("Third Function Started");
  commonModels.forEach((elem, index) => {
    let foundCommonIndex = commonModels.findIndex(
      (item) =>
        item.make == elem.make &&
        item.model == elem.model &&
        item.storage == elem.storage &&
        // item.ram == elem.ram &&
        (item.ram == elem.ram ||
          item.ram == (elem.make == "Apple" ? "--" : "")) &&
        item.condition == elem.condition
    );
    let leastPrice = [];
    commonModels[foundCommonIndex].vendor.forEach((vendorObj) => {
      if (vendorObj.type.toLowerCase() == "buy") {
        leastPrice.push(vendorObj.price);
      }
    });
    if (leastPrice.length > 0) {
      commonModels[foundCommonIndex].priceArray.push(
        Math.min.apply(Math, leastPrice)
      );
    }

    let conditions = ["Like New", "Excellent", "Good"];
    conditions.forEach((forCondition) => {
      let foundConditionIndex = commonModels.findIndex(
        (item) =>
          item.make == elem.make &&
          item.model == elem.model &&
          item.storage == elem.storage &&
          // item.ram == elem.ram &&
          (item.ram == elem.ram ||
            item.ram == (elem.make == "Apple" ? "--" : "")) &&
          item.condition == forCondition
      );
      if (foundConditionIndex != -1) {
        let leastVendorPrice = [];
        commonModels[foundConditionIndex].vendor.forEach((vendorObj) => {
          if (vendorObj.type.toLowerCase() == "buy") {
            leastVendorPrice.push(vendorObj.price);
          }
        });
        if (leastVendorPrice.length > 0) {
          let leaseDerivedPrice = lspFunction(
            elem.condition,
            forCondition,
            Math.min.apply(Math, leastVendorPrice)
          );
          commonModels[foundCommonIndex].priceArray.push(leaseDerivedPrice);
        }
      }
    });
    if (index == commonModels.length - 1) {
      forthFunction(commonModels, false);
    }
  });
};

const forthFunction = (commonModels, goToSix) => {
  // Get one least price from the LSP array and from derived for buy
  sendMailWithAttachment("Forth Function Started");
  commonModels.forEach((element, index) => {
    if (element.priceArray.length > 0) {
      let foundIndex = commonModels.findIndex(
        (item) =>
          item.make == element.make &&
          item.model == element.model &&
          item.storage == element.storage &&
          item.ram == element.ram &&
          item.condition == element.condition
      );
      commonModels[foundIndex].lsp = Math.min.apply(
        Math,
        commonModels[foundIndex].priceArray
      );
      commonModels[foundIndex].type = "buy";
    } else {
      commonModels[index].lsp = 0;
      commonModels[index].type = "";
    }
    if (index == commonModels.length - 1) {
      if (goToSix) {
        sixthFunction(commonModels);
      } else {
        // sixthFunction(commonModels);
        fifthFunction(commonModels);
      }
    }
  });
};

const fifthFunction = (commonModels) => {
  // Handler function for skipped objects for find lsp
  sendMailWithAttachment("Fifth Function Started");
  commonModels.forEach((element, index) => {
    let foundIndex = commonModels.findIndex(
      (item) =>
        item.make == element.make &&
        item.model == element.model &&
        item.storage == element.storage &&
        item.ram == element.ram &&
        item.condition == element.condition &&
        (item.lsp == null || (item.lsp == 0 && item.type == ""))
    );

    if (foundIndex != -1) {
      let conditions = ["Like New", "Excellent", "Good"];
      conditions.forEach((condition) => {
        let foundConditionIndex = commonModels.findIndex(
          (item) =>
            item.make == element.make &&
            item.model == element.model &&
            item.storage == element.storage &&
            item.ram == element.ram &&
            item.condition == condition &&
            item.lsp != null &&
            item.lsp != 0
        );
        if (foundConditionIndex != -1) {
          let leaseDerivedPrice = lspFunction(
            element.condition,
            condition,
            commonModels[foundConditionIndex].lsp
          );
          commonModels[foundIndex].priceArray.push(leaseDerivedPrice);
        }
      });
    }
    if (index == commonModels.length - 1) {
      forthFunction(commonModels, true);
      // fs.writeFileSync(
      //   "foundObjects2.json",
      //   JSON.stringify(commonModels, null, 2)
      // );
    }
  });
};

const sixthFunction = (commonModels) => {
  // For find derivedPrice array by sell just for empty lsp objects
  sendMailWithAttachment("Sixth Function Started");
  commonModels.forEach((elem, index) => {
    let foundCommonIndex = commonModels.findIndex(
      (item) =>
        item.make == elem.make &&
        item.model == elem.model &&
        item.storage == elem.storage &&
        // item.ram == elem.ram &&
        (item.ram == elem.ram ||
          item.ram == (elem.make == "Apple" ? "--" : "")) &&
        item.condition == elem.condition &&
        item.lsp == 0
    );
    if (foundCommonIndex != -1) {
      let maxPrice = [];
      commonModels[foundCommonIndex].vendor.forEach((vendorObj) => {
        if (vendorObj.type.toLowerCase() == "sell") {
          maxPrice.push(vendorObj.price);
        }
      });
      if (maxPrice.length > 0) {
        commonModels[foundCommonIndex].priceArray.push(
          Math.max.apply(Math, maxPrice)
        );
      }

      // let conditions = ["Like New", "Excellent", "Good"];
      // conditions.forEach((forCondition) => {
      let foundConditionIndex = commonModels.findIndex(
        (item) =>
          item.make == elem.make &&
          item.model == elem.model &&
          item.storage == elem.storage &&
          // item.ram == elem.ram &&
          (item.ram == elem.ram ||
            item.ram == (elem.make == "Apple" ? "--" : "")) &&
          item.condition == "Like New" &&
          item.lsp == 0
      );
      if (foundConditionIndex != -1) {
        let leastVendorPrice = [];
        commonModels[foundConditionIndex].vendor.forEach((vendorObj) => {
          if (vendorObj.type.toLowerCase() == "sell") {
            leastVendorPrice.push(vendorObj.price);
          }
        });
        if (leastVendorPrice.length > 0) {
          let leaseDerivedPrice = lspFunction(
            elem.condition,
            "Like New",
            Math.max.apply(Math, leastVendorPrice)
          );
          commonModels[foundCommonIndex].priceArray.push(leaseDerivedPrice);
        }
      }
    }
    // });
    if (index == commonModels.length - 1) {
      seventhFunction(commonModels, false);
    }
  });
};

const seventhFunction = (commonModels, goToNine) => {
  // find maxPrice from that array for lsp
  sendMailWithAttachment("Seventh Function Started");
  commonModels.forEach((element, index) => {
    if (element.priceArray.length > 0) {
      let foundIndex = commonModels.findIndex(
        (item) =>
          item.make == element.make &&
          item.model == element.model &&
          item.storage == element.storage &&
          item.ram == element.ram &&
          item.condition == element.condition &&
          item.type != "buy"
      );
      if (foundIndex != -1) {
        commonModels[foundIndex].lsp = Math.max.apply(
          Math,
          commonModels[foundIndex].priceArray
        );
        commonModels[foundIndex].type = "sell";
      }
    } else {
      commonModels[index].lsp = 0;
      commonModels[index].type = "";
    }
    if (index == commonModels.length - 1) {
      if (goToNine) {
        ninthFunction(commonModels);
      } else {
        // ninthFunction(commonModels);
        eighthFunction(commonModels);
      }
    }
  });
};

const eighthFunction = (commonModels) => {
  // handler function for finding max price for skipped objects
  sendMailWithAttachment("Eighth Function Started");
  commonModels.forEach((element, index) => {
    let foundIndex = commonModels.findIndex(
      (item) =>
        item.make == element.make &&
        item.model == element.model &&
        item.storage == element.storage &&
        item.ram == element.ram &&
        item.condition == element.condition &&
        item.lsp == 0 &&
        item.type == ""
    );
    if (foundIndex != -1) {
      // let conditions = ["Like New", "Excellent", "Good"];
      // conditions.forEach((condition) => {
      let foundConditionIndex = commonModels.findIndex(
        (item) =>
          item.make == element.make &&
          item.model == element.model &&
          item.storage == element.storage &&
          item.ram == element.ram &&
          item.condition == "Like New" &&
          item.lsp != 0
      );
      if (foundConditionIndex != -1) {
        let leaseDerivedPrice = lspFunction(
          element.condition,
          "Like New",
          commonModels[foundConditionIndex].lsp
        );
        commonModels[foundIndex].priceArray.push(leaseDerivedPrice);
      }
    }
    // });
    if (index == commonModels.length - 1) {
      seventhFunction(commonModels, true);
      // fs.writeFileSync(
      //   "foundObjects2.json",
      //   JSON.stringify(commonModels, null, 2)
      // );
    }
  });
};

const ninthFunction = (commonModels) => {
  // Handler for null values in priceArray.
  sendMailWithAttachment("Ninth Function Started");
  commonModels.forEach((element, index) => {
    let newPriceArray = commonModels[index].priceArray.filter((element) => {
      return element != null;
    });
    commonModels[index].priceArray = newPriceArray;
    commonModels[index].lsp =
      commonModels[index].type == "buy"
        ? Math.min.apply(Math, newPriceArray)
        : Math.max.apply(Math, newPriceArray);
    if (index == commonModels.length - 1) {
      tenthFunction(commonModels);
      // fs.writeFileSync(
      //   "foundObjects3.json",
      //   JSON.stringify(commonModels, null, 2)
      // );
    }
  });
};

const tenthFunction = (commonModels) => {
  // Final function for finding derived lsp for skipped objects for both Buy and Sell
  sendMailWithAttachment("Tenth Function Started");
  let finalObjects = [];
  let conditions = ["Like New", "Excellent", "Good", "Fair"];
  commonModels.forEach((element, index) => {
    finalObjects.push(element);
    conditions.forEach((condition) => {
      let foundConditionIndex = commonModels.findIndex(
        (item) =>
          item.make == element.make &&
          item.model == element.model &&
          item.storage == element.storage &&
          item.ram == element.ram &&
          item.condition == condition
      );
      if (foundConditionIndex == -1) {
        let leastDerivedPrice = lspFunction(
          condition,
          element.condition,
          element.lsp
        );
        let newObj = {
          make: element.make,
          model: element.model,
          storage: element.storage,
          ram: element.ram,
          condition: condition,
          priceArray: [],
          vendor: [],
          lsp: leastDerivedPrice,
          type: element.type,
        };
        finalObjects.push(newObj);
      }
    });
    if (index == commonModels.length - 1) {
      // fs.writeFileSync(
      //   "finalObjects.json",
      //   JSON.stringify(finalObjects, null, 2)
      // );
      eleventh(finalObjects);
    }
  });
};

const eleventh = (finalObjects) => {
  // sell multiplied by 1.2 & 1.4
  sendMailWithAttachment("Eleventh Function Started");

  finalObjects.forEach((finalObject, index) => {
    if (finalObjects[index].priceArray == []) {
      delete finalObjects[index][priceArray];
    }
    if (finalObject.type == "sell") {
      // let ind = finalObjects.findIndex(finalObject);
      // if (ind != -1) {
      finalObjects[index].lsp =
        finalObjects[index].lsp *
        (finalObjects[index].make.toLowerCase() == "samsung" ? 1.4 : 1.2);
      // }
    }
    if (index == finalObjects.length - 1) {
      twelth(finalObjects);
    }
  });
};

const twelth = (finalObjects) => {
  // find lsp greater smaller
  sendMailWithAttachment("Twelth Function Started");
  let objectsArr = [];
  // fs.writeFileSync("finalObjects.json", JSON.stringify(finalObjects, null, 2));
  if (allModelNotFound.length > 0) {
    collectData(finalObjects, "complete_lsp_datas");
  }

  finalObjects.forEach((object, index) => {
    let conditions = ["Like New", "Excellent", "Good", "Fair"];
    let priceObj = [];
    conditions.forEach((condition, ind) => {
      let foundConditionIndex = finalObjects.findIndex(
        (item) =>
          item.model == object.model &&
          item.storage == object.storage &&
          item.ram == object.ram &&
          item.condition == condition
      );
      if (foundConditionIndex != -1) {
        priceObj.push({ condition: finalObjects[foundConditionIndex].lsp });
      }
      if (ind == 3) {
        if (
          priceObj[conditions[0]] < priceObj[conditions[1]] ||
          priceObj[conditions[1]] < priceObj[conditions[2]] ||
          priceObj[conditions[2]] < priceObj[conditions[3]]
        ) {
          objectsArr.push(priceObj);
        }
      }
    });
    if (index === finalObjects.length - 1) {
      // fs.writeFileSync("lspMismatch.json", JSON.stringify(objectsArr, null, 2));
      // if (finalObjects.length > 0) {
      //   sendMailWithAttachment(objectsArr, "lspMismatch");
      // }

      lastFunction(finalObjects);
    }
  });
};

const lastFunction = (finalObjects) => {
  sendMailWithAttachment("Last Function Started");
  fileData.forEach((elm, index) => {
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
    // handliing poco in model name //

    mdl = mdl.toLowerCase().replace(/poco/g, "xiaomi poco").trim();

    // handling spaces in model name
    mdl = mdl.toLowerCase().replace(/ /g, "").trim();

    // handling + for plus in model name
    mdl = mdl.toLowerCase().replace(/\+/g, "plus").trim();

    // handling moto & motorola in model name
    mdl = mdl
      .toLowerCase()
      .replace(/motorola moto/g, "motorola")
      .trim();
    mdl = mdl.toLowerCase().replace(/moto /g, "motorola ").trim();

    let objArray = finalObjects.filter((element) => {
      let marketingName = element.model;
      // handle poco, 5g, spaces and + in marketingName
      marketingName = marketingName.toLowerCase().replace(/5g/g, "").trim();
      marketingName = marketingName
        .toLowerCase()
        .replace(/poco/g, "xiaomi poco")
        .trim();
      marketingName = marketingName.toLowerCase().replace(/ /g, "").trim();
      marketingName = marketingName.toLowerCase().replace(/\+/g, "plus").trim();
      marketingName = marketingName
        .toLowerCase()
        .replace(/motorola moto/g, "motorola")
        .trim();
      marketingName = marketingName
        .toLowerCase()
        .replace(/moto /g, "motorola ")
        .trim();

      if (
        marketingName.toLowerCase() == mdl ||
        marketingName == elm.model_name
      ) {
        return element;
      }
    });

    if (!objArray || objArray.length == 0) {
      console.log("objArray", objArray.length);
      if (
        !allModelNotFound.includes("Data: " + mdl) &&
        !allModelNotFound.includes("Data: " + elm.model_name) &&
        !allModelNotFound.includes("GSM: " + mdl) &&
        !allModelNotFound.includes("GSM: " + elm.model_name)
      ) {
        allModelNotFound.push("Data: " + elm.model_name);
      }
    }

    if (index === fileData.length - 1) {
      // fs.writeFileSync(
      //   "modelsNotFound.json",
      //   JSON.stringify(allModelNotFound, null, 2)
      // );
      // setTimeout(() => {
      //   if (allModelNotFound.length > 0) {
      //     sendMailWithAttachment(allModelNotFound, "modelsNotFound").catch(
      //       (err) => {
      //         console.log("mail error",err);
      //       }
      //     );
      //   }
      // }, 5000);
    }
  });
};

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
