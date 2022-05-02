const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const logEvent = require("../../src/middleware/event_logging");

router.get("/listing", async (req, res) => {
  try {
    const listingId = req.query.userUniqueId;
    const dataObject = await saveListingModal.findById(listingId);

    if (!dataObject) {
      res.status(404).json({ message: "Listing not found" });
      return;
    } else {
      res.status(200).json({
        reason: "Listing found successfully",
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

router.get("/listings", async (req, res) => {
  try {
    const userUniqueId = req.query.userUniqueId;
    const dataObject = await saveListingModal.find({userUniqueId});

    if (!dataObject) {
      res.status(404).json({ message: "User unique ID not found" });
      return;
    } else {
      res.status(200).json({
        reason: "Listings found successfully",
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

router.post("/listing/save", async (req, res) => {

  const charger = req.body.charger;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
  const deviceFinalGrade = req.body.deviceFinalGrade;
  const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
  const listedBy = req.body.listedBy;
  const deviceStorage = req.body.deviceStorage;
  const earphone = req.body.earphone;
  const images = req.body.images;
  const imei = req.body.imei;
  const listingLocation = req.body.listingLocation;
  const listingPrice = req.body.listingPrice;
  const make = req.body.make;
  const marketingName = req.body.marketingName;
  const mobileNumber = req.body.mobileNumber.toString().slice(2, -1);
  const model = req.body.model;
  const originalbox = req.body.originalbox;
  const platform = req.body.platform;
  const recommendedPriceRange = req.body.recommendedPriceRange;
  const userUniqueId = req.body.userUniqueId;

  const data = {
    charger,
    color,
    deviceCondition,
    deviceCosmeticGrade,
    deviceFinalGrade,
    deviceFunctionalGrade,
    listedBy,
    deviceStorage,
    earphone,
    images,
    imei,
    listingLocation,
    listingPrice,
    make,
    marketingName,
    mobileNumber,
    model,
    originalbox,
    platform,
    recommendedPriceRange,
    userUniqueId,
  };

    const modalInfo = new saveListingModal(data);
    try {
        const dataObject = await modalInfo.save();
        res
      .status(201)
      .json({
        reason: "Modal list created",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });
    return;
    } catch (error) {
        console.log(error);
    res.status(400).json(error);
    }
});

module.exports = router;
