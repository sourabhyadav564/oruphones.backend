const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");
const validUser = require("../../src/middleware/valid_user");

router.post("/add", validUser, logEvent, async (req, res) => {
  const listingId = req.body.listingId;
  const userUniqueId = req.body.userUniqueId;

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });


    // To update a particular document, whether it is existing or not. You need to first get all the elements out of the array and push into another array. And then get the ID of that object and save it using "findByIdAndUpdate" ----> getFavObject._id,

    if (getFavObject) {
      let arr = [];

      //adding all the listing id to arr
      getFavObject.fav_listings.forEach((item) => {
        arr.push(item);
      });

      if (!arr.includes(listingId)) {
        arr.push(listingId);

        let listingArray = {
          fav_listings: arr,
        };
        const updateList = await favoriteModal.findByIdAndUpdate(
          getFavObject._id,
          listingArray,
          {
            new: true,
          }
        );
        res.status(200).json({
          reason: "Favorite listings updated successfully",
          statusCode: 200,
          status: "SUCCESS",
          updateList,
        });
      } else {
        res.status(200).json({
          reason: "Listing already exists in your favorite list",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    } else {
      const data = {
        fav_listings: listingId,
        userUniqueId: userUniqueId,
      };

      const listing_data = new favoriteModal(data);
      const dataObject = await listing_data.save();

      res.status(201).json({
        reason: "Favorite listings created successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/deactivate", validUser, logEvent, async (req, res) => {
  const listingId = req.query.listingId;
  const userUniqueId = req.query.userUniqueId;

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

    if (getFavObject) {
      let arr = [];
      arr = getFavObject.fav_listings;

      if (arr.includes(listingId)) {
        // arr.splice(arr.indexOf(listingId), 1);

        for (var i = arr.length - 1; i >= 0; i--) {
          if (arr[i] === listingId) {
            arr.splice(i, 1);
          }
        }

        let listingArray = {
          fav_listings: arr,
        };
        const updateList = await favoriteModal.findByIdAndUpdate(
          getFavObject._id,
          listingArray,
          {
            new: true,
          }
        );

        res.status(200).json({
          reason: "Favorite listing updated successfully",
          statusCode: 200,
          status: "SUCCESS",
          updateList,
        });
      } else {
        res.status(200).json({
          reason: "Favorite listing already deactivated",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    } else {
      res.status(200).json({
        reason: "Favorite listing does not exist",
        statusCode: 200,
        status: "SUCCESS",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/fetch", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.query.userUniqueId;

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

    let dataObject = [];

    if (getFavObject && getFavObject?.fav_listings.length > 0) {
      let arr = [];
      arr = getFavObject.fav_listings;
      let allFavListings = [];

      for (item in arr) {
        let single_listing = await saveListingModal.findOne({
          listingId: arr[item],
          status: ["Active", "Sold_Out"]
        });
        if (single_listing) {
          single_listing = {
            ...single_listing?._doc,
            imagePath: single_listing?.defaultImage?.fullImage,
          };
          // remove mobileNumber from the response if exists
          if (single_listing?.mobileNumber) {
            delete single_listing.mobileNumber;
          }
          allFavListings.push(single_listing);
        }
        if (item == arr.length - 1) {

          if (allFavListings.length > 0) {
            dataObject = allFavListings;
            res.status(200).json({
              reason: "Favorite listings fetched successfully",
              statusCode: 200,
              status: "SUCCESS",
              dataObject,
            });
          } else {
            res.status(200).json({
              reason: "You do not have any favourite listing",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: [],
            });
          }
        }
      }
    } else {
      res.status(200).json({
        reason: "Favorite listing does not exist",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
