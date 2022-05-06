const express = require("express");
const router = express.Router();

require("../../src/database/connection");
// const listingByMakeModal = require("../../src/database/modals/listing/listing_by_make");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.get("/topselling/models", async (req, res) => {
  try {
    const listings = await saveListingModal.find();

    // console.log("Listings", listings);

    const topModels = async () => {
      let dataObject = [];
      let modelVals = [];

      listings.forEach(async (item, i) => {
        let modelName = item.marketingName;
        let bool = false;
        // let count = 0;

        if (!modelVals.includes(modelName)) {
          // console.log(modelName);
          let data = {
            make: item.make,
            marketingName: item.marketingName,
            startingFrom: item.listingPrice,
            maxPrice: item.listingPrice,
            imagePath: item.defaultImage.fullImage,
            displayOrder: 9999,
            isTopSelling: false,
            quantity: 1,
          };
          // if (!modelVals.includes(modelName)) {
          modelVals.push(modelName);
          // }
          dataObject.push(data);
        } else {
          let data = {};
          dataObject.forEach(async (mObj, k) => {
            if (Object.values(mObj).includes(modelName)) {
              // let stf = mObj.startingFrom.replace(",", "");
              // let maxP = mObj.maxPrice.replace(",", "");
              // let listP = item.listingPrice.replace(",", "");
              let stf = mObj.startingFrom;
              let maxP = mObj.maxPrice;
              let listP = item.listingPrice;

              let startFrom =
                parseInt(stf) > parseInt(listP)
                  ? item.listingPrice
                  : mObj.startingFrom;
              let mPrice =
                parseInt(maxP) > parseInt(listP)
                  ? mObj.maxPrice
                  : item.listingPrice;

              // console.log("\n start: " + startFrom + " max: " + mPrice + "\n")
              // console.log("s: " + stf + " m: " + maxP + " l: " + listP);
              data = {
                make: mObj.make,
                marketingName: mObj.marketingName,
                startingFrom: startFrom,
                maxPrice: mPrice,
                imagePath: mObj.imagePath,
                displayOrder: 99,
                isTopSelling: false,
                quantity: mObj.quantity + 1,
              };
              bool = true;
            }
            if (k == dataObject.length - 1) {
              let objIndex = dataObject.findIndex(
                (obj) => obj.listingId == mObj.listingId
              );
              dataObject[objIndex] = data;
            }
          });
        }

        if (i == listings.length - 1) {
          console.log("dataObject", dataObject);
          // res.send(dataObject)
          // next();
          console.log("dataObject", dataObject);
        }
      });
      return dataObject;
    };

    const dataObject = await topModels();
    //TODO: Save the title object in the database for top selling collection
    res.status(200).json({
      reason: "Listings by marketing name",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
