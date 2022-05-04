const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.post("/add", async (req, res) => {
  const listingId = req.body.listingId;
  const userUniqueId = req.body.userUniqueId;

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

    // console.log("getFavObject", getFavObject);

    // To update a particular document, whether it is existing or not. You need to first get all the elements out of the array and push into another array. And then get the ID of that object and save it using "findByIdAndUpdate" ----> getFavObject._id,

    if (getFavObject) {
      let arr = [];
      getFavObject.fav_listings.forEach((item) => {
        arr.push(item);
      });

      if (!arr.includes(listingId)) {
        arr.push(listingId);
      } else {
        res.status(200).json({
          reason: "Listing already exists in your favorite list",
          statusCode: 200,
          status: "SUCCESS",
        });
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
      //   console.log("updateList", updateList);
      res.status(200).json({
        reason: "Favorite listings updated successfully",
        statusCode: 200,
        status: "SUCCESS",
        updateList,
      });
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

router.post("/deactivate", async (req, res) => {
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

router.post("/fetch", async (req, res) => {
  const userUniqueId = req.query.userUniqueId;

  try {
    const getFavObject = await favoriteModal.findOne({
      userUniqueId: userUniqueId,
    });

    if (getFavObject) {
      let arr = [];
      arr = getFavObject.fav_listings;

      let dataObject = [];

      arr.forEach(async (item, index) => {
        //   console.log("item", item);
        const single_listing = await saveListingModal.findOne({
          listingId: item,
        });
        dataObject.push(single_listing);
        if (dataObject.length === arr.length) {
          res.status(200).json({
            reason: "Favorite listings fetched successfully",
            statusCode: 200,
            status: "SUCCESS",
            dataObject,
          });
        }
      });

      //   res.status(200).json({
      //     reason: "Favorite listing fetched successfully",
      //     statusCode: 200,
      //     status: "SUCCESS",
      //     listings,
      // });
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