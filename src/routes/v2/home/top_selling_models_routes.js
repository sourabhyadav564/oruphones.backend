const express = require("express");
const router = express.Router();
const saveListingModal = require("../../../database/modals/device/save_listing_device");
const logEvent = require('../../../middleware/log_event');
const redis = require("../../../../config/redis");

router.get("/topselling/models", async (req, res) => {
  try {
    // Check if the data exists in Redis
    const cachedData = await redis.get("topselling_models");
    if (cachedData) {
      const dataObject = JSON.parse(cachedData);
      return res.status(200).json({
        reason: "Listings by marketing name (from Redis)",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }

    const listings = await saveListingModal.find();

    const topModels = async () => {
      let dataObject = [];
      let modelVals = [];

      listings.forEach(async (item, i) => {
        let modelName = item.marketingName;

        if (!modelVals.includes(modelName)) {
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
          modelVals.push(modelName);
          dataObject.push(data);
        } else {
          let data = {};
          var modObj = dataObject.filter((obj) => {
            return obj.marketingName === modelName;
          });

          let mObj = modObj[0];
          let stf = mObj.startingFrom;
          let maxP = mObj.maxPrice;
          let listP = item.listingPrice;

          let startFrom =
            parseInt(stf) > parseInt(listP) ? item.listingPrice : mObj.startingFrom;
          let mPrice =
            parseInt(maxP) > parseInt(listP) ? mObj.maxPrice : item.listingPrice;

          data = {
            make: mObj.make,
            marketingName: mObj.marketingName,
            startingFrom: startFrom,
            maxPrice: mPrice,
            imagePath: mObj.imagePath,
            displayOrder: 9999,
            isTopSelling: false,
            quantity: mObj.quantity + 1,
          };
          let objIndex = dataObject.findIndex(
            (obj) => obj.marketingName === mObj.marketingName
          );
          dataObject[objIndex] = data;
        }
      });
      return dataObject.sort(function (a, b) {
        return b.quantity - a.quantity;
      });
    };

    const dataObject = await topModels();

    // Store the data in Redis with an expiration time of 24 hours (86400 seconds)
    await redis.set("topselling_models", JSON.stringify(dataObject), "EX", 86400);

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
