const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const cityModal = require("../../src/database/modals/global/cities_modal");
const logEvent = require("../../src/middleware/event_logging");

const NodeCache = require("node-cache");
const shortLinkModal = require("../../src/database/modals/others/short_link_model");

const cache = new NodeCache({ stdTTL: 10, checkperiod: 120 });

router.get("/cities", async (req, res) => {
  if (cache.has("cities")) {
    res.status(200).json({
      reason: "Cities found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: cache.get("cities"),
    });
  } else {
    try {
      let dataObject = [];
      dataObject.push({
        _id: "627ff0daad80a210af722de4675f8f8f",
        displayWithImage: "0",
        city: "India",
      });
      let dataObject2 = await cityModal.find();
      dataObject = dataObject.concat(dataObject2);
      cache.set("cities", dataObject);
      res.status(200).json({
        reason: "Cities found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
});

router.get("/getLink", logEvent, async (req, res) => {
  try {
    const keyId = req.query.keyId;
    const getData = await shortLinkModal.findOne({ unKey: keyId });
    if (getData) {
      res.status(200).json({
        reason: "Link found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          link: getData.linkStr,
        },
      });
    } else {
      res.status(404).json({
        reason: "Link not found",
        statusCode: 404,
        status: "FAILURE",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
