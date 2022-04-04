const express = require("express");
const router = express.Router();

require("../src/database/connection");
const saveListingModal = require("../src/database/modals/save_listing_device");

router.post("/device/listing/save", async (req, res) => {
    const modalInfo = new saveListingModal(req.body);
    console.log(req.body);
    try {
        const dataObject = await modalInfo.save();
        res
      .status(201)
      .json({
        reason: "Modals List Created found",
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
