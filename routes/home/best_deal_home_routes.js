const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const bestDealHomeModel = require("../../src/database/modals/home/best_deals_home");

router.get("/listings/best/nearme", async (req, res) => {
  const location = req.query.location;
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

  const citiesForIndia = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
  ];

  let bestDeals = [];
  let otherListings = [];

  try {
    let defaultDataObject;
    if (location === "India") {
      defaultDataObject = await bestDealHomeModel.find({
        listingLocation: citiesForIndia,
      });
    } else {
      defaultDataObject = await bestDealHomeModel.find({
        listingLocation: location,
      });
    }

    defaultDataObject.filter((item) => {
      has_charger_percentage = item.make === "Apple" ? 10 : 5;
      has_earphone_percentage = item.make === "Apple" ? 10 : 5;

      basePrice = parseInt(item.listingPrice.toString().replace(",", ""));
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

      let currentPercentage = ((notionalPrice - basePrice) / basePrice) * 100;
      // console.log("item", {...item._doc, currentPercentage: currentPercentage});
      let newDataObject = {...item._doc, notionalPercentage: currentPercentage};
      bestDeals.push(newDataObject);
      // console.log("newDataObject", newDataObject);
    });

    bestDeals.sort((a, b) => {
      if (a.notionalPercentage > b.notionalPercentage) return -1;
    });

    bestDeals.length = bestDeals.length >= 5 ? 5 : bestDeals.length;

    // const new1 = saveData.filter((item) => {
    //     let tempItem;
    //   Object.keys(finalBestDealForHome).forEach((key) => {
    //     if (item._id.toString() === key) {
    //         tempItem = item;
    //     }
    //   });
    //   return tempItem;
    // });

    // console.log("new1", new1);

    // const sortable = Object.fromEntries(
    //     saveData.forEach((item) => {
    //         Object.entries(item.).sort(([,a],[,b]) => b-a).slice(0,5);
    //     }))
    // );

    // console.log("sortable", sortable);

    res.status(200).json({
      reason: "Best deals found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        otherListings: otherListings,
        bestDeals: bestDeals,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
