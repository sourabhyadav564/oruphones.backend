const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const getThirdPartyVendors = require("../../utils/third_party_listings");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const getBestDeals = require("../../utils/get_best_deals");

router.post("/listings/search", async (req, res) => {
  const userUniqueId = req.query.userUniqueId;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceStorage = req.body.deviceStorage;
  const make = req.body.make;
  const listingLocation = req.body.listingLocation;
  const maxsellingPrice = req.body.maxsellingPrice;
  const minsellingPrice = req.body.minsellingPrice;
  const reqPage = req.body.reqPage;
  const verified = req.body.verified === "verified" ? true : false;
  const warenty = req.body.warenty;
  const marketingName = req.body.marketingName;

  try {
    let allListings = [];
    let listing = [];
    if (marketingName.length > 0) {
      let ourListing = await saveListingModal.find(
        { marketingName: marketingName[0] },
        { _id: 0 }
      );
      listing.push(...ourListing);
      i = 0;
      while (i < marketingName.length) {
        console.log("i", i);
        let newListings = await getThirdPartyVendors(marketingName[i], "");
        newListings.forEach((thirdPartyVendor) => {
          listing.push(thirdPartyVendor);
        });
        i++;
      }
    } else if (make.length > 0) {
      let ourListing = await saveListingModal.find({ make: make }, { _id: 0 });
      listing.push(...ourListing);
      i = 0;
      while (i < make.length) {
        console.log("i", i);
        let newListings = await getThirdPartyVendors("", make[i]);
        newListings.forEach((thirdPartyVendor) => {
          listing.push(thirdPartyVendor);
        });
        i++;
      }
    } else {
      console.log("no make");
      const thirdPartyVendors = await getThirdPartyVendors("", "");
      thirdPartyVendors.forEach((thirdPartyVendor) => {
        listing.push(thirdPartyVendor);
      });
    }

    listing.filter((item, index) => {
      if (make.length > 0) {
        if (make.includes(item.make)) {
          allListings.push(item);
        }
      } else if (color.length > 0 && make.length === 0 && reqPage !== "TSM") {
        if (color.includes(item.color)) {
          allListings.push(item);
        }
      } else if (
        deviceCondition.length > 0 &&
        make.length === 0 &&
        reqPage !== "TSM"
      ) {
        if (deviceCondition.includes(item.deviceCondition)) {
          allListings.push(item);
        }
      } else if (deviceStorage.length > 0 && make.length === 0) {
        if (deviceStorage.includes(item.deviceStorage)) {
          allListings.push(item);
        }
      } else if (listingLocation === item.listingLocation) {
        let tempListings = [];
        tempListings = allListings.filter((item, index) => {
          return item.listingLocation === listingLocation;
        });
        allListings = tempListings;
      } else if (parseInt(maxsellingPrice) > parseInt(item.listingPrice)) {
        allListings.push(item);
      } else if (parseInt(minsellingPrice) < parseInt(item.listingPrice)) {
        allListings.push(item);
      } else {
        allListings.push(item);
      }

      // if(warenty === item.warenty){
      //     allListings.push(item);
      // }
    });

    if (verified === true) {
      let tempListings = [];
      tempListings = allListings.filter((item, index) => {
        if (item.verified === true) {
          return true;
        }
      });
      allListings = tempListings;
    }

    //Best deal starts here

    // let basePrice;
    // let notionalPrice;
    // const verified_percentage = 10;
    // const warranty_percentage1 = 10;
    // const warranty_percentage2 = 8;
    // const warranty_percentage3 = 5;
    // const warranty_percentage4 = 0;
    // let has_charger_percentage = 0;
    // let has_earphone_percentage = 0;
    // const has_original_box_percentage = 3;
    let location = listingLocation;

    // // const citiesForIndia = [
    // //   "Delhi",
    // //   "Mumbai",
    // //   "Bangalore",
    // //   "Hyderabad",
    // //   "Chennai",
    // //   "Kolkata",
    // // ];

    // let finalBestDeals = [];
    // let otherListings = [];
    // let updatedBestDeals = [];

    // let favList = [];
    // if (userUniqueId !== "Guest") {
    //   const getFavObject = await favoriteModal.findOne({
    //     userUniqueId: userUniqueId,
    //   });

    //   if (getFavObject) {
    //     favList = getFavObject.fav_listings;
    //   } else {
    //     favList = [];
    //   }
    // }

    let defaultDataObject = [];
    if (location === "India") {
      // defaultDataObject = await bestDealHomeModel.find(
      // let defaultDataObject2 = await saveListingModal
      //   .find
      //   //       {
      //   //     listingLocation: citiesForIndia,
      //   //   }
      //   ();
      let defaultDataObject2 = allListings;
      defaultDataObject2.forEach((element) => {
        defaultDataObject.push(element);
      });
      // const thirdPartyVendors = await getThirdPartyVendors("", "");
      // thirdPartyVendors.forEach((thirdPartyVendor) => {
      //   defaultDataObject.push(thirdPartyVendor);
      // });
    } else {
      // defaultDataObject = await bestDealHomeModel.find({
      // defaultDataObject = await saveListingModal.find({
      //   listingLocation: location,
      // });
      defaultDataObject = allListings;
    }

    getBestDeals(defaultDataObject, userUniqueId, res, false);

    // const filterData = async () => {
    //   let bestDeals = [];
    //   let dIndex = 0;

    //   const filterData2 = async (
    //     make,
    //     marketingname,
    //     condition,
    //     storage,
    //     hasCharger,
    //     isAppleChargerIncluded,
    //     hasEarphone,
    //     isAppleEarphoneIncluded,
    //     hasOrignalBox,
    //     isVarified,
    //     item
    //   ) => {
    //     const getPrice = async () => {
    //       // console.log("into getPrice");
    //       const price = await getRecommendedPrice(
    //         make,
    //         marketingname,
    //         condition,
    //         storage,
    //         hasCharger,
    //         isAppleChargerIncluded,
    //         hasEarphone,
    //         isAppleEarphoneIncluded,
    //         hasOrignalBox,
    //         isVarified,
    //         false
    //       );
    //       // console.log("price", price);
    //       if (price !== null) {
    //         afterGetPrice(price);
    //         return price;
    //       }
    //     };

    //     getPrice();

    //     // getPrice().then((price) => {
    //       const afterGetPrice = async (price) => {
    //         basePrice = price.actualLSP;
    //         // console.log("basePrice", basePrice);
    //         notionalPrice = parseInt(
    //           item.listingPrice.toString().replace(",", "")
    //         );
    //         // notionalPrice = basePrice;
  
    //         if ("verified" in item === true) {
    //           if (item.verified === true) {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * verified_percentage;
    //           }
    //         }
  
    //         if ("warranty" in item === true) {
    //           if (item.warranty === "0-3 months") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * warranty_percentage1;
    //           } else if (item.warranty === "4-6 months") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * warranty_percentage2;
    //           } else if (item.warranty === "7-10 months") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * warranty_percentage3;
    //           } else {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * warranty_percentage4;
    //           }
    //         }
  
    //         if ("charger" in item === true) {
    //           if (item.charger === "Y") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * has_charger_percentage;
    //           }
    //         }
  
    //         if ("earphone" in item === true) {
    //           if (item.earphone === "Y") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * has_earphone_percentage;
    //           }
    //         }
  
    //         if ("originalbox" in item === true) {
    //           if (item.originalbox === "Y") {
    //             notionalPrice =
    //               notionalPrice - (basePrice / 100) * has_original_box_percentage;
    //           }
    //         }
  
    //         let currentPercentage;
    //         // if (item.listingPrice > notionalPrice) {
    //         //   currentPercentage =
    //         //     ((item.listingPrice - notionalPrice) / item.listingPrice) * 100;
    //         // } else {
    //         //   currentPercentage =
    //         //     ((notionalPrice - item.listingPrice) / item.listingPrice) * 100;
    //         // }
    //         currentPercentage = ((basePrice - notionalPrice) / basePrice) * 100;
    //         // let newDataObject = {
    //         //   ...item._doc,
    //         //   notionalPercentage: currentPercentage,
    //         // };
    //         let newDataObject = {};
    //         if (item.isOtherVendor == "Y") {
    //           // newDataObject = item;
    //           newDataObject = {
    //             ...item,
    //             notionalPercentage: currentPercentage,
    //           };
    //         } else {
    //           newDataObject = {
    //             ...item._doc,
    //             notionalPercentage: currentPercentage,
    //           };
    //         }
    //         bestDeals.push(newDataObject);
    //         // });
    //         dIndex++;
    //         // console.log("index", dIndex);
    //         // console.log("length", defaultDataObject.length);
    //         if (dIndex === defaultDataObject.length && bestDeals.length > 0) {
    //           // console.error("bestDeals22", bestDeals);
    //           afterGetingBestDeals(bestDeals);
    //           // return bestDeals;
    //         }
    //       };
    //   };

    //   defaultDataObject.filter(async (item, index) => {
    //     has_charger_percentage = item.make === "Apple" ? 10 : 5;
    //     has_earphone_percentage = item.make === "Apple" ? 10 : 5;

    //     // By Nishant on 10/05/22

    //     let make = item.make;
    //     let marketingname = item.marketingName;
    //     let condition = item.deviceCondition;
    //     let storage = item.deviceStorage;
    //     const hasCharger = req.body.charger === "Y" ? true : false;
    //     const isAppleChargerIncluded =
    //       item.make === "Apple" ? hasCharger : false;
    //     const hasEarphone = item.earphone === "Y" ? true : false;
    //     const isAppleEarphoneIncluded =
    //       item.make === "Apple" ? hasEarphone : false;
    //     const hasOrignalBox = item.originalbox === "Y" ? true : false;
    //     const isVarified = item.verified === "no" ? false : true;

    //     filterData2(
    //       make,
    //       marketingname,
    //       condition,
    //       storage,
    //       hasCharger,
    //       isAppleChargerIncluded,
    //       hasEarphone,
    //       isAppleEarphoneIncluded,
    //       hasOrignalBox,
    //       isVarified,
    //       item
    //     );
    //   });
    // };

    // filterData();

    // // filterData().then((bestDeals) => {
    // const afterGetingBestDeals = async (bestDeals) => {
    //   // console.log("bestDeals", bestDeals);
    //   // console.log("bestDeals", bestDeals);
    //   bestDeals.forEach((item, index) => {
    //     if (reqPage === "BBNM") {
    //       if (item.notionalPercentage > 0) {
    //         finalBestDeals.push(item);
    //       } else {
    //         otherListings.push(item);
    //       }
    //     } else if (reqPage === "TSM") {
    //       otherListings.push(item);
    //     }
    //   });

    //   finalBestDeals.sort((a, b) => {
    //     if (a.notionalPercentage > b.notionalPercentage) return -1;
    //   });

    //   finalBestDeals.length =
    //     finalBestDeals.length >= 16 ? 16 : finalBestDeals.length;

    //   // adding image path to each listing
    //   finalBestDeals.forEach((item, index) => {
    //     if (!item.images.length) {
    //       finalBestDeals[index].imagePath = item.defaultImage.fullImage;
    //     } else {
    //       finalBestDeals[index].imagePath = item.images[0].fullImage;
    //     }
    //   });

    //   otherListings.forEach((item, index) => {
    //     if (!item.images.length) {
    //       otherListings[index].imagePath = item.defaultImage.fullImage;
    //     } else {
    //       otherListings[index].imagePath = item.images[0].fullImage;
    //     }
    //   });

    //   if (userUniqueId !== "Guest") {
    //     // add favorite listings to the final list
    //     finalBestDeals.forEach((item, index) => {
    //       if (favList.includes(item.listingId)) {
    //         finalBestDeals[index].favourite = true;
    //       } else {
    //         finalBestDeals[index].favourite = false;
    //       }
    //     });
    //   }

    //   finalBestDeals.forEach((item, index) => {
    //     if (
    //       updatedBestDeals.length <= 5 
    //       // &&
    //       // item.notionalPercentage > 0 &&
    //       // item.notionalPercentage < 50
    //     ) {
    //       updatedBestDeals.push(item);
    //     } else {
    //       otherListings.push(item);
    //     }
    //   });

    //   let nullOtherList = [];

    //   otherListings.forEach((item, index) => {
    //     console.log(item.notionalPercentage.toString());
    //     if (item.notionalPercentage.toString() === "NaN") {
    //       nullOtherList.push(item);
    //       otherListings.splice(index, 1);
    //     }
    //   })

    //   otherListings.sort((a, b) => {
    //     if (a.notionalPercentage > b.notionalPercentage) return -1;
    //   });

    //   otherListings.push(...nullOtherList);

    //   // return finalBestDeals
    //   // console.log("finalbestdeals", finalBestDeals);

    //   if (finalBestDeals.length > 0 || otherListings.length > 0) {
    //     res.status(200).json({
    //       reason: "Best deals found",
    //       statusCode: 200,
    //       status: "SUCCESS",
    //       dataObject: {
    //         otherListings: otherListings,
    //         bestDeals: updatedBestDeals,
    //       },
    //     });
    //   } else {
    //     res.status(200).json({
    //       reason: "Best deals found",
    //       statusCode: 200,
    //       status: "SUCCESS",
    //       dataObject: {
    //         otherListings: [],
    //         bestDeals: [],
    //       },
    //     });
    //   }
    // };

    // //Best deal ends here
    // // res.status(200).json({
    // //   reason: "Filters list fetched Successfully",
    // //   statusCode: 200,
    // //   status: "SUCCESS",
    // //   listing,
    // // });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
