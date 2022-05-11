const express = require("express");
const connection = require("../src/database/mysql_connection");
const fs = require("fs");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://HP_8440p:HP_8440p@cluster0.8jcx1.mongodb.net/testing_application_data?retryWrites=true&w=majority";

// require("../../src/database/connection");
const scrappedModal = require("../src/database/modals/others/scrapped_models");
// const smartphoneModal = require("../../src/database/modals/others/smartphone_models");

let lspArray = [];

// try {
//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("testing_application_data");
//     // var myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.collection("complete_scrapped_models").deleteMany({});
//       // .delete(lspArray, function (err, res) {
//       //   if (err) throw err;
//       //   console.log(
//       //     `${
//       //       lspArray.length
//       //     } documents inserted successfully on ${Date.now()}`
//       //   );
//       //   db.close();
//       // });
//   });
// } catch (error) {
//   console.log(error);
// }

const calculate_LSP_BUY = async () => {
  try {
    let query =
      "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 72 hour;select * from `web_scraper_model`;";

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
          lspArray.forEach(async (element, i) => {
            if (
              element.model_id === item.model_id &&
              element.mobiru_condition === item.mobiru_condition &&
              element.storage === (`${item.storage} GB`)
            ) {
              if (element.price > item.price) {
                found = true;
              } else {
                lspArray.splice(i, 1);
                found = true;
              }
            }
          });
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
            lspObject["mobiru_condition"] = item.mobiru_condition;
            lspObject["storage"] = (`${item.storage} GB`); //TODO: add GB to storage
            lspObject["ram"] = item.ram;
            lspObject["link"] = item.link;
            lspObject["warranty"] = item.warranty;
            lspObject["vendor_id"] = item.vendor_id;
            lspObject["type"] = "buy";
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
        // try {
        //   MongoClient.connect(url, function (err, db) {
        //     if (err) throw err;
        //     var dbo = db.db("testing_application_data");
        //     // var myobj = { name: "Company Inc", address: "Highway 37" };
        //     dbo
        //       .collection("buy_scrapped_models")
        //       .insertMany(lspArray, function (err, res) {
        //         if (err) throw err;
        //         console.log(`${lspArray.length} documents inserted successfully`);
        //         db.close();
        //       });
        //   });
        // } catch (error) {
        //   console.log(error);
        // }
        // console.log("lspArray", lspArray);
        // fs.writeFileSync("lsp.json", JSON.stringify(lspArray));
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const calculate_LSP_SELL = async () => {
  try {
    let query =
      "select * from `web_scraper_sellmodelwisescraping` where created_at > now() - interval 48 hour;select * from `web_scraper_model`;";

    connection.query(query, [2, 1], (err, results, fields) => {
      if (err) {
        console.log(err);
      } else {
        let models = results[1];
        let scrappedModels = results[0];
        // console.log("models", scrappedModels.length);
        // fs.writeFileSync("scrapped.json", JSON.stringify(scrappedModels));

        // let lspArray = [];
        scrappedModels.forEach(async (item, index) => {
          let lspObject = {};
          let found = false;
          lspArray.forEach(async (element, i) => {
            if (
              element.model_id === item.model_id &&
              element.mobiru_condition === item.mobiru_condition &&
              element.storage === (`${item.storage} GB`)
            ) {
              if (element.price > item.price) {
                found = true;
              } else {
                lspArray.splice(i, 1);
                found = true;
              }
            }
          });
          if (!found) {
            const matchedModel = models.find((elem) => {
              // elem.id === item.model_id;
              // console.log("elem", elem);
              if (elem.id === item.model_id) {
                return elem;
              }
            });
            // console.log("matchedModel", matchedModel);
            let derivedPrice = item.heading.includes("Samsung")
              ? item.price + item.price * 0.4
              : item.price + item.price * 0.2;
            console.log(
              item.heading.split(" ")[0],
              " : price: ",
              item.price,
              "derivedPrice: ",
              derivedPrice
            );
            lspObject["model_id"] = item.model_id;
            lspObject["model_name"] = matchedModel.name;
            lspObject["price"] = Math.ceil(derivedPrice);
            lspObject["mobiru_condition"] = item.mobiru_condition;
            lspObject["storage"] = (`${item.storage} GB`); //TODO: add GB to storage
            lspObject["ram"] = item.ram;
            lspObject["link"] = item.link;
            lspObject["warranty"] = item.warranty;
            lspObject["vendor_id"] = item.vendor_id;
            lspObject["type"] = "sell";
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
            // var myobj = { name: "Company Inc", address: "Highway 37" };
            dbo
              .collection("complete_scrapped_models")
              .deleteMany({})
              .then(() => {
                dbo
                  .collection("complete_scrapped_models")
                  .insertMany(lspArray, function (err, res) {
                    if (err) throw err;
                    console.log(
                      `${
                        lspArray.length
                      } documents inserted successfully on ${Date.now()}`
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

calculate_LSP_BUY().then(() => {
  // console.log("entered into then");
  calculate_LSP_SELL();
  // console.log("exited from then");
});

// module.exports = calculate_LSP;
