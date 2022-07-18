const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const logEvent = require("../../src/middleware/event_logging");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");

router.get("/share/link", async (req, res) => {
  const listingId = req.query.listingId;
  const userUniqueId = req.query.userUniqueId;
  try {
    const listing = await saveListingModal.findOne({ listingId: listingId });
    console.log("listing", listing);
    const make = listing.make;
    const model = listing.marketingName.replaceAll(" ", "");
    const productId = listing.listingId;

    const static_link = `${"https://oru-phones-web.vercel.app"}/product/listings/${make}/${model}/${productId}?isOtherVendor=N`;

    const dataObject = {
      url: static_link,
      content: [
        {
          sharePlatform: "whatsapp",
          shareContent: "Hey There, Check this product on ORU Phones",
        },
        {
          sharePlatform: "others",
          shareContent: "Hey There, Check this product on ORU Phones",
        },
      ],
    };
    res.status(200).json({
      reason: "Product link generated successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
