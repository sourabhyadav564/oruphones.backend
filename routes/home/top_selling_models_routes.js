const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const listingByMakeModal = require("../../src/database/modals/listing/listing_by_make");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.get("/topselling/models", async (req, res) => {
  try {
    // const listings = await saveListingModal.find();

    // const topModels = async () => {
    //   let dataObject = [];
    //   let modelVals = [];

    //   listings.forEach(async (item, i) => {
    //     let modelName = item.marketingName;
    //     if (!modelVals.includes(modelName)) {
    //       let data = {
    //         make: item.make,
    //         marketingName: item.marketingName,
    //         startingFrom: item.listingPrice,
    //         maxPrice: item.listingPrice,
    //         imagePath: item.defaultImage.fullImage,
    //         displayOrder: 9999,
    //         isTopSelling: false,
    //         quantity: 1,
    //       };
    //       modelVals.push(modelName);
    //       dataObject.push(data);
    //     } else {
    //       let data = {};
    //       var modObj = dataObject.filter(obj => {
    //         return obj.marketingName === modelName;
    //       })

    //       let mObj = modObj[0];
    //       let stf = mObj.startingFrom;
    //       let maxP = mObj.maxPrice;
    //       let listP = item.listingPrice;

    //       let startFrom =
    //         parseInt(stf) > parseInt(listP)
    //           ? item.listingPrice
    //           : mObj.startingFrom;
    //       let mPrice =
    //         parseInt(maxP) > parseInt(listP)
    //           ? mObj.maxPrice
    //           : item.listingPrice;

    //       data = {
    //         make: mObj.make,
    //         marketingName: mObj.marketingName,
    //         startingFrom: startFrom,
    //         maxPrice: mPrice,
    //         imagePath: mObj.imagePath,
    //         displayOrder: 9999,
    //         isTopSelling: false,
    //         quantity: mObj.quantity + 1,
    //       };
    //       let objIndex = dataObject.findIndex(
    //         (obj) => obj.marketingName === mObj.marketingName
    //       );
    //       dataObject[objIndex] = data;
    //     }
    //   });
    //   dataObject.sort(function (a, b) { return b.quantity - a.quantity });
    //   // return dataObject.slice(0, 50);
    //   return dataObject;
    // };

    // let dataObject = await topModels();

    // rewriting above code to get top selling models with faster response time
    let dataObject = await saveListingModal.aggregate([
      {
        $group: {
          _id: "$marketingName",
          make: { $first: "$make" },
          marketingName: { $first: "$marketingName" },
          maxPrice: { $max: { $toInt: "$listingPrice" } },
          minPrice: { $min: { $toInt: "$listingPrice" } },
          imagePath: { $first: "$defaultImage.fullImage" },
          displayOrder: { $first: 9999 },
          isTopSelling: { $first: false },
          quantity: { $sum: 1 },
        },
      },
      // addField for startingFrom
      {
        $addFields: {
          startingFrom: {
            $toString: { $min: "$minPrice" },
          },
        },
      },
      // now remove minPrice and maxPrice fields
      {
        $project: {
          minPrice: 0,
          maxPrice: 0,
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 50 },
    ]);

    // let allModels = [];
    // allModels = allModels.concat(dataObject.map((item) => item.marketingName));

    // let allModels = await saveListingModal.distinct("marketingName");
    // for allModels we need count of each model
    let allModels = await saveListingModal.aggregate([
      {
        $group: {
          _id: "$marketingName",
          marketingName: { $first: "$marketingName" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);


    res.status(200).json({
      reason: "Listings by marketing name",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
      allModels,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
