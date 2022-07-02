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

// require("../../src/database/connection");
const scrappedModal = require("../src/database/modals/others/scrapped_models");
// const smartphoneModal = require("../../src/database/modals/others/smartphone_models");

let lspArray = [];
let finalScrappedModelObject = [];
let currentDate = new Date();
let dateFormat = moment(currentDate).add(10, "days").calendar();

const get_external_source_buy = async () => {
  try {
    let query =
      "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 10 day;select * from `web_scraper_model`;";

    connection.query(query, [2, 1], (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        let models = results[1];
        let scrappedModels = results[0];
        // console.log("models", scrappedModels.length);
        // fs.writeFileSync("scrapped.json", JSON.stringify(scrappedModels));

        scrappedModels.forEach(async (item, index) => {
          let lspObject = {};
          let found = false;
          if (item.storage === null) {
            console.error("storage is null: ", item.model_id);
          }
          // lspArray.forEach(async (element, i) => {
          //   if (
          //     element.model_id === item.model_id &&
          //     (element.mobiru_condition === item.mobiru_condition ||
          //       (element.mobiru_condition === "Excellent" &&
          //         item.mobiru_condition === null)) &&
          //     element.storage === `${item.storage} GB` &&
          //     element.type === "buy"
          //   ) {
          //     if (element.price <= item.price) {
          //       found = true;
          //     } else {
          //       lspArray.splice(i, 1);
          //       // found = true;
          //     }
          //   }
          // });
          // getting model name from model object
          if (!found) {
            const matchedModel = models.find((elem) => {
              // elem.id === item.model_id;
              // console.log("elem", elem);
              if (elem.id === item.model_id) {
                return elem;
              }
            });
            // console.log("matchedModel", matchedModel);
            lspObject["model_id"] = item.model_id;
            lspObject["model_name"] = matchedModel.name;
            lspObject["price"] = item.price;
            lspObject["mobiru_condition"] =
              item.mobiru_condition ?? "Excellent";
            lspObject["storage"] = item.storage ? `${item.storage} GB` : "0 GB";
            lspObject["ram"] = item.ram;
            lspObject["link"] = item.link;
            lspObject["warranty"] = item.warranty;
            lspObject["vendor_id"] = item.vendor_id;
            lspObject["type"] = "buy";
            lspObject["actualPrice"] = item.price;
            lspArray.push(lspObject);
            // try {
            //     const refindedScrappedModelObject = new scrappedModal(lspObject);
            //     const savedObject = await refindedScrappedModelObject.save();
            //     if(savedObject) {
            //         console.log("Huryyyyyyyy");
            //     } else {
            //         console.log("Nooooo");
            //     }
            // } catch (error) {
            //     console.log(error);
            // }
          }
        });
        try {
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("testing_application_data");
            dbo
              .collection("external_source_for_buys")
              .deleteMany({})
              .then(() => {
                dbo
                  .collection("external_source_for_buys")
                  .insertMany(lspArray, function (err, res) {
                    if (err) throw err;
                    console.log(
                      `${lspArray.length} documents inserted successfully`
                    );
                    db.close();
                  });
              });
          });
        } catch (error) {
          console.log(error);
        }
        // console.log("lspArray", lspArray);
        // fs.writeFileSync("lsp.json", JSON.stringify(lspArray));
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const start_migrating_external_source_buy = async () => {
  // calculate_LSP_BUY().then(() => {
  //   console.log("entered into then");
  //   calculate_LSP_SELL()
  //   console.log("exited from then");
  // });
  get_external_source_buy();
};

module.exports = start_migrating_external_source_buy;
