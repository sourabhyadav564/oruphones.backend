const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
// const favoriteModal = require("../src/database/modals/favorite/favorite_add");
const logEvent = require("../../src/middleware/event_logging");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const getThirdPartyVendors = require("../../utils/third_party_listings");

router.get("/shopbyprice/listmodel", async (req, res) => {
  //   const location = req.query.location;
  //   const category = req.query.category;
  //   const userUniqueId = req.query.userUniqueId;
  //   // const location = "India";
  //   // Put keys always in lower case when get data from headers
  //   // const userUniqueId = "Guest";
  const startPrice = req.query.start;
  const endPrice = req.query.end;
  const location = req.query.listingLocation;
  const userUniqueId = req.query.userUniqueId;

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

    let defaultDataObject = [];
    if (location === "India") {
      let defaultDataObject2 = [];
      //  if (category === "Fifteen") {
      defaultDataObject2 = await saveListingModal.find({
        $expr: {
            $lte: [
              {
                $toInt: "$listingPrice",
              },
              parseInt(endPrice.toString()),
            ],
          },
      });
      let defaultDataObject3 = defaultDataObject2.filter((item, index) => {
        return parseInt(item.listingPrice.toString()) >= parseInt(startPrice.toString());
      })
        defaultDataObject2 = defaultDataObject3;
      //   }
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
    //   const thirdPartyVendors = await getThirdPartyVendors("", "");
    //   thirdPartyVendors.forEach((thirdPartyVendor) => {
    //     defaultDataObject.push(thirdPartyVendor);
    //   });
    } else {
      defaultDataObject = await saveListingModal.find({
        listingLocation: location,
      });
      if (category === "Fifteen") {
        // defaultDataObject = await saveListingModal.find({
        //   $expr: {
        //     $lt: [
        //       {
        //         $toInt: "$listingPrice",
        //       },
        //       15000,
        //     ],
        //   },
        // });
        defaultDataObject = await saveListingModal.find({
            $expr: {
                $lte: [
                  {
                    $toInt: "$listingPrice",
                  },
                  parseInt(endPrice.toString()),
                ],
              },
          });
          let defaultDataObject3 = defaultDataObject.filter((item, index) => {
            return parseInt(item.listingPrice.toString()) >= parseInt(startPrice.toString());
          })
            defaultDataObject = defaultDataObject3;
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
          // console.log("basePrice", basePrice);
          notionalPrice = parseInt(
            item.listingPrice.toString().replace(",", "")
          );
          // notionalPrice = basePrice;

          if ("verified" in item === true) {
            if (item.verified === true) {
              notionalPrice =
                notionalPrice - (basePrice / 100) * verified_percentage;
            }
          }

          if ("warranty" in item === true) {
            if (item.warranty === "0-3 months") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * warranty_percentage1;
            } else if (item.warranty === "4-6 months") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * warranty_percentage2;
            } else if (item.warranty === "7-10 months") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * warranty_percentage3;
            } else {
              notionalPrice =
                notionalPrice - (basePrice / 100) * warranty_percentage4;
            }
          }

          if ("charger" in item === true) {
            if (item.charger === "Y") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * has_charger_percentage;
            }
          }

          if ("earphone" in item === true) {
            if (item.earphone === "Y") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * has_earphone_percentage;
            }
          }

          if ("originalbox" in item === true) {
            if (item.originalbox === "Y") {
              notionalPrice =
                notionalPrice - (basePrice / 100) * has_original_box_percentage;
            }
          }

          let currentPercentage;
          // if (item.listingPrice > notionalPrice) {
          //   currentPercentage =
          //     ((item.listingPrice - notionalPrice) / item.listingPrice) * 100;
          // } else {
          //   currentPercentage =
          //     ((notionalPrice - item.listingPrice) / item.listingPrice) * 100;
          // }
          currentPercentage = ((basePrice - notionalPrice) / basePrice) * 100;
          // let newDataObject = {
          //   ...item._doc,
          //   notionalPercentage: currentPercentage,
          // };
          let newDataObject = {};
          if (item.isOtherVendor == "Y") {
            // newDataObject = item;
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

      // finalBestDeals.length =
      //   finalBestDeals.length >= 16 ? 16 : finalBestDeals.length;

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

      finalBestDeals.forEach((item, index) => {
        if (
          updatedBestDeals.length <= 5 
          // &&
          // item.notionalPercentage > 0 &&
          // item.notionalPercentage < 50
        ) {
          updatedBestDeals.push(item);
        } else {
          otherListings.push(item);
        }
      });

      let nullOtherList = [];

      otherListings.forEach((item, index) => {
        console.log(item.notionalPercentage.toString());
        if (item.notionalPercentage.toString() === "NaN") {
          nullOtherList.push(item);
          otherListings.splice(index, 1);
        }
      })

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
    };
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
