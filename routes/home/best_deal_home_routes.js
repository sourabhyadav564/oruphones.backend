const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");

const getRecommendedPrice = require("../../utils/get_recommended_price");

router.get("/listings/best/nearme", async (req, res) => {
  const location = req.query.location;
  // Put keys always in lower case when get data from headers
  const userUniqueId = req.headers.useruniqueid;

  // let make = "OnePlus";
  // let marketingname = "OnePlus 7";
  // let condition = "Excellent";
  // let storage = "128";
  // const hasCharger = false;
  // const isAppleChargerIncluded = false;
  // const hasEarphone = false;
  // const isAppleEarphoneIncluded = false;
  // const hasOrignalBox = false;
  // const isVarified = true;

  // const price = await getRecommendedPrice(
  //   make,
  //   marketingname,
  //   condition,
  //   storage,
  //   hasCharger,
  //   isAppleChargerIncluded,
  //   hasEarphone,
  //   isAppleEarphoneIncluded,
  //   hasOrignalBox,
  //   isVarified
  // );

  // console.log("recomended price", price);

  let basePrice;
  let notionalPrice;
  const verified_percentage = 10;
  const warranty_percentage1 = 10;
  const warranty_percentage2 = 8;
  const warranty_percentage3 = 5;
  const warranty_percentage4 = 0;
  let has_charger_percentage = 0;
  let has_earphone_percentage = 0;
  const has_original_box_percentage = 3;

  // const citiesForIndia = [
  //   "Delhi",
  //   "Mumbai",
  //   "Bangalore",
  //   "Hyderabad",
  //   "Chennai",
  //   "Kolkata",
  // ];

  let otherListings = [];
  let finalBestDeals = [];

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

    let favList = [];
    if (getFavObject) {
      favList = getFavObject.fav_listings;
    } else {
      favList = [];
    }

    // console.log("Favorite listings", favList);

    let defaultDataObject;
    if (location === "India") {
      // defaultDataObject = await bestDealHomeModel.find(
      defaultDataObject = await saveListingModal
        .find
        //   {
        //   listingLocation: citiesForIndia,
        // }
        ();
    } else {
      // defaultDataObject = await bestDealHomeModel.find({
      defaultDataObject = await saveListingModal.find({
        listingLocation: location,
      });
    }

    // console.log("defaultDataObject", defaultDataObject);
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
          // console.log("into getPrice");
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
            isVarified
          );
          // console.log("price", price);
          if (price !== null) {
            afterGetPrice(price);
            return price;
          }
        };

        getPrice();

        // getPrice().then((price) => {
        const afterGetPrice = async (price) => {
          basePrice = price.leastSellingprice;
          // console.log("basePrice", basePrice);
          // basePrice = parseInt(item.listingPrice.toString().replace(",", ""));
          notionalPrice = basePrice;

          if ("verified" in item === true) {
            if (item.verified === true) {
              notionalPrice =
                notionalPrice + (basePrice / 100) * verified_percentage;
            }
          }

          if ("warranty" in item === true) {
            if (item.warranty === "0-3 months") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * warranty_percentage1;
            } else if (item.warranty === "4-6 months") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * warranty_percentage2;
            } else if (item.warranty === "7-10 months") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * warranty_percentage3;
            } else {
              notionalPrice =
                notionalPrice + (basePrice / 100) * warranty_percentage4;
            }
          }

          if ("charger" in item === true) {
            if (item.charger === "Y") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_charger_percentage;
            }
          }

          if ("earphone" in item === true) {
            if (item.earphone === "Y") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_earphone_percentage;
            }
          }

          if ("originalbox" in item === true) {
            if (item.originalbox === "Y") {
              notionalPrice =
                notionalPrice + (basePrice / 100) * has_original_box_percentage;
            }
          }

          let currentPercentage =
            ((notionalPrice - basePrice) / basePrice) * 100;
          let newDataObject = {
            ...item._doc,
            notionalPercentage: currentPercentage,
          };
          bestDeals.push(newDataObject);
          // });
          dIndex++;
          // console.log("index", dIndex);
          // console.log("length", defaultDataObject.length);
          if (dIndex === defaultDataObject.length && bestDeals.length > 0) {
            // console.error("bestDeals22", bestDeals);
            afterGetingBestDeals(bestDeals);
            // return bestDeals;
          }
        };
      };

      defaultDataObject.filter(async (item, index) => {
        has_charger_percentage = item.make === "Apple" ? 10 : 5;
        has_earphone_percentage = item.make === "Apple" ? 10 : 5;

        // By Nishant on 10/05/22

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

    // filterData().then((bestDeals) => {
    const afterGetingBestDeals = async (bestDeals) => {
      // console.log("bestDeals", bestDeals);
      // console.log("bestDeals", bestDeals);
      bestDeals.forEach((item, index) => {
        if (item.notionalPercentage > 0) {
          finalBestDeals.push(item);
        }
      });

      finalBestDeals.sort((a, b) => {
        if (a.notionalPercentage > b.notionalPercentage) return -1;
      });

      finalBestDeals.length =
        finalBestDeals.length >= 16 ? 16 : finalBestDeals.length;

      // adding image path to each listing
      finalBestDeals.forEach((item, index) => {
        if (!item.images.length) {
          finalBestDeals[index].imagePath = item.defaultImage.fullImage;
        } else {
          finalBestDeals[index].imagePath = item.images[0].fullImage;
        }
      });

      // add favorite listings to the final list
      finalBestDeals.forEach((item, index) => {
        if (favList.includes(item.listingId)) {
          finalBestDeals[index].favourite = true;
        } else {
          finalBestDeals[index].favourite = false;
        }
      });

      // return finalBestDeals
      // console.log("finalbestdeals", finalBestDeals);

      if (finalBestDeals.length > 0) {
        res.status(200).json({
          reason: "Best deals found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            otherListings: otherListings,
            bestDeals: finalBestDeals,
          },
        });
      } else {
        res.status(200).json({
          reason: "Best deals found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            otherListings: otherListings,
            bestDeals: [],
          },
        });
      }
    };
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
