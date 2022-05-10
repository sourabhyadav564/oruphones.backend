const express = require("express");
const router = express.Router();
const moment = require("moment");

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const connection = require("../../src/database/mysql_connection");

const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");

router.get("/listing/buyer/verification", async (req, res) => {
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

router.get("/listing/sendverification", async (req, res) => {
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

module.exports = router;
