const express = require("express");
const mongoose = require("mongoose");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const router = express.Router();

require("../../src/database/connection");

router.get("/getImages", async (req, res) => {
  try {
    const listings = await saveListingModal.find({
      images: { $exists: true, $ne: [] },
    });

    let dataToBeSend = [];

    listings.forEach((listing) => {
      listing.images.forEach((image) => {
        console.log(image);
        if ("isVarified" in image && image.isVarified === "default") {
          let dataObject = {};
          dataObject = {
            listingId: image._id,
            status: image.isVarified,
            marketingName: listing.marketingName ? listing.marketingName : "",
            defaultImage: listing.defaultImage.fullImage
              ? listing.defaultImage.fullImage
              : "",
            verifyImage: image.fullImage ? image.fullImage : "",
          };
          dataToBeSend.push(dataObject);
        }
      });
    });

    res.status(200).json({
      reason: "Images Found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: dataToBeSend,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/verifyImage", async (req, res) => {
  try {
    const listingId = req.body.listingId;
    const imageStatus = req.body.imageStatus;

    const images = await saveListingModal.find({
      images: { $exists: true, $ne: [] },
      images: {
        $elemMatch: {
          _id: mongoose.Types.ObjectId(listingId),
        },
      },
    });

    if (!images) {
      res.status(202).json({
        reason: "Notification image found",
        statusCode: 202,
        status: "ACCEPTED",
      });
      return;
    }

    const imageIndex = images[0].images.findIndex((element) => {
      return element._id.toString() === listingId.toString();
    });

      images[0].images[imageIndex].isVarified = imageStatus;

      const updatedImage = await images[0].save();

      res.status(200).json({
        reason: "Image status updated successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: updatedImage,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
