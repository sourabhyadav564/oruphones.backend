const express = require("express");
const router = express.Router();

require("../src/database/connection");
const saveListingModal = require("../src/database/modals/device/save_listing_device");
const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../src/middleware/event_logging");
const getRecommendedPrice = require("../utils/get_recommended_price");
const getThirdPartyVendors = require("../utils/third_party_listings");
const allMatrix = require("../utils/matrix_figures");

const getBestDeals = async (
  defaultDataObject,
  userUniqueId,
  res,
  forNearMe
) => {
  //   const location = req.query.userLocation;
  //   const userUniqueId = req.headers.useruniqueid;

  let basePrice;
  let notionalPrice;
  const verified_percentage = allMatrix.bestDealFigures.verified_percentage;
  const warranty_percentage1 = allMatrix.bestDealFigures.warranty_percentage1;
  // const warranty_percentage2 = 8;
  // const warranty_percentage3 = 5;
  // const warranty_percentage4 = 0;
  let has_charger_percentage =
    allMatrix.bestDealFigures.has_non_apple_charger_percentage;
  let has_earphone_percentage =
    allMatrix.bestDealFigures.has_non_apple_earphone_percentage;
  const has_original_box_percentage =
    allMatrix.bestDealFigures.has_original_box_percentage;

  let finalBestDeals = [];
  let otherListings = [];
  let updatedBestDeals = [];

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

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

    // let defaultDataObject = [];
    // if (location === "India") {
    //   let defaultDataObject2 = await saveListingModal.find(
    //     {}
    //   );
    //   defaultDataObject2.forEach((element) => {
    //     defaultDataObject.push(element);
    //   });
    //   const thirdPartyVendors = await getThirdPartyVendors("", "");
    //   thirdPartyVendors.forEach((thirdPartyVendor) => {
    //     defaultDataObject.push(thirdPartyVendor);
    //   });
    // } else {
    //   let defaultDataObject2 = await saveListingModal.find({
    //     listingLocation: location,
    //   });
    //   defaultDataObject2.forEach((element) => {
    //     defaultDataObject.push(element);
    //   });
    //   const thirdPartyVendors = await getThirdPartyVendors("", "");
    //   thirdPartyVendors.forEach((thirdPartyVendor) => {
    //     defaultDataObject.push(thirdPartyVendor);
    //   });
    // }

    const filterData = async () => {
      let bestDeals = [];
      let dIndex = 0;

      const filterData2 = async (
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
        item
      ) => {
        const getPrice = async () => {
          const price = await getRecommendedPrice(
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
            false
          );
          if (price !== null) {
            afterGetPrice(price);
            return price;
          }
        };

        getPrice();

        const afterGetPrice = async (price) => {
          basePrice = price.actualLSP;
          notionalPrice = parseInt(
            item.listingPrice.toString().replace(",", "")
          );

          if ("verified" in item === true && item.isOtherVendor === "N") {
            if (item.verified != true) {
              console.log("into verified");
              notionalPrice =
                notionalPrice + (basePrice / 100) * verified_percentage;
            }
          }

          if ("warranty" in item != true && item.isOtherVendor === "N") {
            console.log("into warranty");
            // if (item.warranty === "0-3 months") {
            notionalPrice =
              notionalPrice + (basePrice / 100) * warranty_percentage1;
            // } else if (item.warranty === "4-6 months") {
            //   notionalPrice =
            //     notionalPrice + (basePrice / 100) * warranty_percentage2;
            // } else if (item.warranty === "7-10 months") {
            //   notionalPrice =
            //     notionalPrice + (basePrice / 100) * warranty_percentage3;
            // } else {
            //   notionalPrice =
            //     notionalPrice + (basePrice / 100) * warranty_percentage4;
            // }
          }

          if ("charger" in item === true) {
            if (item.charger === "N") {
              console.log("into charger");
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_charger_percentage;
            }
          }

          if ("earphone" in item === true) {
            if (item.earphone === "N") {
              console.log("into earphone");
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_earphone_percentage;
            }
          }

          if ("originalbox" in item === true) {
            if (item.originalbox === "N") {
              console.log("into originalbox");
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_original_box_percentage;
            }
          }

          let currentPercentage;
          currentPercentage = ((basePrice - notionalPrice) / basePrice) * 100;

          console.log("lsp", basePrice);
          console.log("listing price", item.listingPrice.toString());
          console.log("notional price", notionalPrice);
          console.log("percent", currentPercentage);
          console.log("---------");
          console.log("item", item);
          console.log("----------------------------------------------");

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
        const hasCharger = item.charger === "Y" ? true : false;
        const isAppleChargerIncluded =
          item.make === "Apple" ? hasCharger : false;
        const hasEarphone = item.earphone === "Y" ? true : false;
        const isAppleEarphoneIncluded =
          item.make === "Apple" ? hasEarphone : false;
        const hasOrignalBox = item.originalbox === "Y" ? true : false;
        const isVarified = item.verified === "no" ? false : true;

        filterData2(
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
      });

      otherListings.forEach((item, index) => {
        if (!item.images.length) {
          otherListings[index].imagePath = item.defaultImage.fullImage;
        } else {
          otherListings[index].imagePath = item.images[0].fullImage;
        }
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

      if (forNearMe) {
        otherListings = [];
      }
      let ArrayLen = forNearMe ? 15 : 5;
      finalBestDeals.forEach((item, index) => {
        if (updatedBestDeals.length < ArrayLen) {
          updatedBestDeals.push(item);
        } else {
          if (!forNearMe) {
            otherListings.push(item);
          }
        }
      });

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

      if (finalBestDeals.length > 0 || otherListings.length > 0) {
        res.status(200).json({
          reason: "Best deals found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            otherListings: otherListings,
            bestDeals: updatedBestDeals,
          },
        });
      } else {
        res.status(200).json({
          reason: "Best deals found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            otherListings: [],
            bestDeals: [],
          },
        });
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