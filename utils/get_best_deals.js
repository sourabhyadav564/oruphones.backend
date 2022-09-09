const express = require("express");
const router = express.Router();

require("../src/database/connection");
const saveListingModal = require("../src/database/modals/device/save_listing_device");
const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../src/middleware/event_logging");
const getRecommendedPrice = require("../utils/get_recommended_price");
const getThirdPartyVendors = require("../utils/third_party_listings");
const allMatrix = require("../utils/matrix_figures");
const fs = require("fs");

const nodemailer = require("nodemailer");
const moment = require("moment");
const dotenv = require("dotenv");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");
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

let currentDate = new Date();
let dateFormat = moment(currentDate).add(10, "days").calendar();

const collectData = async (data) => {
  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(process.env.Collection);
      dbo
        .collection("complete_best_deals")
        .deleteMany({})
        .then(() => {
          dbo
            .collection("complete_best_deals")
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
      to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp",
      // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp",
      subject: "Best Deals data has successfully been migrated to MongoDB",
      text:
        "Best Deals data has been successfully migrated to MongoDB in the master best deals collection and the number of deals are: " +
        data.length +
        ". The data is not ready to use for other business logics",
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

const getBestDeals = async (
  defaultDataObject,
  userUniqueId,
  // res,
  forNearMe
  // totalProducts
) => {
  //   const location = req.query.userLocation;
  //   const userUniqueId = req.headers.useruniqueid;

  // if (defaultDataObject.length == 0) {
  //   res.status(200).json({
  //     reason: "Sorry!!! Listings not found",
  //     statusCode: 200,
  //     status: "SUCCESS",
  //     dataObject: {
  //       otherListings: [],
  //       bestDeals: [],
  //     },
  //   });
  //   return;
  // }

  let testScrappedModalData = await testScrappedModal.find({});

  let basePrice;
  let notionalPrice;
  const verified_percentage = allMatrix.bestDealFigures.verified_percentage;
  const warranty_percentage1 = allMatrix.bestDealFigures.warranty_percentage1;
  const warranty_percentage2 = allMatrix.bestDealFigures.warranty_percentage2;
  const warranty_percentage3 = allMatrix.bestDealFigures.warranty_percentage3;
  // const warranty_percentage2 = 8;
  // const warranty_percentage3 = 5;
  // const warranty_percentage4 = 0;
  let has_charger_percentage =
    allMatrix.bestDealFigures.has_non_apple_charger_percentage;
  let has_earphone_percentage =
    allMatrix.bestDealFigures.has_non_apple_earphone_percentage;
  const has_original_box_percentage =
    allMatrix.bestDealFigures.has_original_box_percentage;
  const third_party_warranty_percentage =
    allMatrix.bestDealFigures.third_party_warranty_percentage;

  let finalBestDeals = [];
  let otherListings = [];
  let updatedBestDeals = [];

  try {
    let favList = [];
    if (userUniqueId !== "Guest") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    const filterData = async () => {
      let bestDeals = [];
      let dIndex = 0;

      const filterData2 = async (
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
        item
      ) => {
        const getPrice = async () => {
          const price = await getRecommendedPrice(
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
            false
          );
          if (price !== null) {
            afterGetPrice(price);
            return price;
          }
        };

        getPrice();

        const afterGetPrice = async (price) => {
          let deduction = 0;
          basePrice = price.actualLSP;
          notionalPrice = parseInt(
            item.listingPrice.toString().replace(",", "")
          );

          if ("charger" in item === true) {
            if (item.charger === "N") {
              deduction = deduction + has_charger_percentage;
              // notionalPrice =
              // notionalPrice + (basePrice / 100) * has_charger_percentage;
            }
          }

          if ("earphone" in item === true) {
            if (item.earphone === "N") {
              deduction = deduction + has_earphone_percentage;
              // notionalPrice =
              //   notionalPrice + (basePrice / 100) * has_earphone_percentage;
            }
          }

          if ("originalbox" in item === true) {
            if (item.originalbox === "N") {
              deduction = deduction + has_original_box_percentage;
              // notionalPrice =
              //   notionalPrice + (basePrice / 100) * has_original_box_percentage;
            }
          }

          notionalPrice = notionalPrice - (basePrice / 100) * deduction;

          // let testScrappedModal = JSON.parse(
          //   fs.readFileSync("testing_scrapped_datas.json")
          // );

          // let getCashifyListing = await testScrappedModal.findOne({
          //   model_name: marketingname,
          //   make: make,
          //   storage: parseInt(storage.toString().split(" ")[0].toString()),
          //   type: "sell",
          //   vendor_id: 8,
          // });

          let getCashifyListingList = testScrappedModalData.filter((item) => {
            if (
              item.model_name === marketingname &&
              item.make === make &&
              item.storage ===
                parseInt(storage.toString().split(" ")[0].toString()) &&
              item.type === "sell" &&
              item.vendor_id === 8
            ) {
              return item;
            }
          });

          let getCashifyListing = getCashifyListingList[0];

          if ("warranty" in item == true && item.isOtherVendor === "N") {
            let cashify_upto_price = 0;


            if (getCashifyListing) {
              cashify_upto_price = getCashifyListing.price;

              let warrantyWeight = 0;
              const warranty = item.warranty;

              if (warranty == "More than 9 months") {
                warrantyWeight = warranty_percentage1;
              } else if (warranty == "More than 6 months") {
                warrantyWeight = warranty_percentage2;
              } else if (warranty == "More than 3 months") {
                warrantyWeight = warranty_percentage3;
              }

              notionalPrice =
                notionalPrice - (cashify_upto_price / 100) * warrantyWeight;
            }
          }

          let thirdPartyDeduction =
            has_charger_percentage +
            has_earphone_percentage +
            has_original_box_percentage +
            third_party_warranty_percentage;

          let newBasePrice =
            basePrice - (basePrice / 100) * thirdPartyDeduction;

          let currentPercentage;
          currentPercentage =
            ((newBasePrice - notionalPrice) / newBasePrice) * 100;


          let newDataObject = {};
          if (item.isOtherVendor == "Y") {
            newDataObject = {
              ...item,
              notionalPercentage: currentPercentage,
            };
          } else {
            newDataObject = {
              ...item._doc,
              notionalPercentage: currentPercentage,
            };
          }
          bestDeals.push(newDataObject);
          dIndex++;
          if (dIndex === defaultDataObject.length && bestDeals.length > 0) {
            afterGetingBestDeals(bestDeals);
          }
        };
      };

      defaultDataObject.filter(async (item, index) => {
        has_charger_percentage =
          item.make === "Apple"
            ? allMatrix.bestDealFigures.has_apple_charger_percentage
            : allMatrix.bestDealFigures.has_non_apple_charger_percentage;
        has_earphone_percentage =
          item.make === "Apple"
            ? allMatrix.bestDealFigures.has_apple_earphone_percentage
            : allMatrix.bestDealFigures.has_non_apple_earphone_percentage;
        let make = item.make;
        let marketingname = item.marketingName;
        let condition = item.deviceCondition;
        let storage = item.deviceStorage;
        let ram = item.deviceRam;
        const hasCharger = item.charger === "Y" ? true : false;
        const isAppleChargerIncluded =
          item.make === "Apple" ? hasCharger : false;
        const hasEarphone = item.earphone === "Y" ? true : false;
        const isAppleEarphoneIncluded =
          item.make === "Apple" ? hasEarphone : false;
        const hasOrignalBox = item.originalbox === "Y" ? true : false;
        const isVarified =
          item.verified === "no" || !item.verified ? false : true;

        filterData2(
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
          item
        );
      });
    };

    filterData();

    const afterGetingBestDeals = async (bestDeals) => {
      bestDeals.forEach((item, index) => {
        if (item.notionalPercentage > 0) {
          finalBestDeals.push(item);
        } else {
          otherListings.push(item);
        }
      });

      finalBestDeals.sort((a, b) => {
        if (a.notionalPercentage > b.notionalPercentage) return -1;
      });

      // adding image path to each listing
      finalBestDeals.forEach((item, index) => {
        if (!item.images.length) {
          finalBestDeals[index].imagePath = item.defaultImage.fullImage;
        } else {
          finalBestDeals[index].imagePath = item.images[0].fullImage;
        }
        let tempDate = moment(item.createdAt).format("MMM Do");
        finalBestDeals[index].listingDate = tempDate.toString();

        // let formattedPrice = parseInt(item.listingPrice).toLocaleString("en-IN", {
        //   maximumFractionDigits: 2,
        //   style: "currency",
        //   currency: "INR",
        // });
        // finalBestDeals[index].listingPrice = formattedPrice.toString();
      });

      otherListings.forEach((item, index) => {
        if (!item.images.length) {
          otherListings[index].imagePath = item.defaultImage.fullImage;
        } else {
          otherListings[index].imagePath = item.images[0].fullImage;
        }
        let tempDate = moment(item.createdAt).format("MMM Do");
        otherListings[index].listingDate = tempDate.toString();

        // let formattedPrice = parseInt(item.listingPrice).toLocaleString("en-IN", {
        //   maximumFractionDigits: 2,
        //   style: "currency",
        //   currency: "INR",
        // });
        // console.log("formattedPrice", formattedPrice);
        // otherListings[index].listingPrice = formattedPrice.toString();
      });

      if (userUniqueId !== "Guest") {
        // add favorite listings to the final list
        finalBestDeals.forEach((item, index) => {
          if (favList.includes(item.listingId)) {
            finalBestDeals[index].favourite = true;
          } else {
            finalBestDeals[index].favourite = false;
          }
        });
      }

      // if (forNearMe) {
      //   otherListings = [];
      // }
      let otherBestDeals = [];
      let ArrayLen = forNearMe ? 15 : 5;
      finalBestDeals.forEach((item, index) => {
        if (updatedBestDeals.length < ArrayLen) {
          updatedBestDeals.push(item);
        } else {
          if (!forNearMe) {
            otherBestDeals.push(item);
          }
        }
      });
      otherBestDeals.push(...otherListings);
      // otherBestDeals = otherBestDeals;

      let nullOtherList = [];

      otherListings.forEach((item, index) => {
        if (item.notionalPercentage.toString() === "NaN") {
          nullOtherList.push(item);
          otherListings.splice(index, 1);
        }
      });

      otherListings.sort((a, b) => {
        if (a.notionalPercentage > b.notionalPercentage) return -1;
      });

      otherListings.push(...nullOtherList);

      // TEMP CHANGE STARTED
      updatedBestDeals.push(...otherBestDeals);
      // updatedBestDeals.push(...otherListings);
      // TEMP CHANGE ENDED

      if (finalBestDeals.length > 0 || otherListings.length > 0) {
        // res.status(200).json({
        //   reason: "Best deals found",
        //   statusCode: 200,
        //   status: "SUCCESS",
        //   dataObject: {
        //     // otherListings: otherListings,
        //     bestDeals: updatedBestDeals,
        //     totalProducts: totalProducts
        //   },
        // });
        collectData(updatedBestDeals);
        // fs.writeFileSync(`updatedBestDeals.json`, JSON.stringify(updatedBestDeals));
      } else {
        // res.status(200).json({
        //   reason: "Best deals found",
        //   statusCode: 200,
        //   status: "SUCCESS",
        //   dataObject: {
        //     otherListings: [],
        //     bestDeals: [],
        //   },
        // });
      }
      // let dataObject = {
      //             otherListings: otherListings || [],
      //             bestDeals: updatedBestDeals || [],
      //           }

      // return dataObject;
    };
  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
  }
};

module.exports = getBestDeals;
