const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const cityModal = require("../../src/database/modals/global/cities_modal");
const logEvent = require("../../src/middleware/event_logging");

const NodeCache = require("node-cache");
const shortLinkModal = require("../../src/database/modals/others/short_link_model");

// const cache = new NodeCache({ stdTTL: 10, checkperiod: 120 });

router.get("/cities", async (req, res) => {
  // if (cache.has("cities")) {
  //   res.status(200).json({
  //     reason: "Cities found",
  //     statusCode: 200,
  //     status: "SUCCESS",
  //     dataObject: cache.get("cities"),
  //   });
  // } else {
  try {
    let limited = req.query.limited || false;
    let searchText = req.query.searchText || "";
    let dataObject = [];
    dataObject.push({
      _id: "627ff0daad80a210af722de4675f8f8f",
      displayWithImage: "0",
      city: "India",
    });
    let dataObject2 = [];
    if (!searchText || searchText == "") {
      let exper = limited ? { displayWithImage: "1" } : {};
      dataObject2 = await cityModal.find(exper);
    } else {
      let dataObject3 = await cityModal
        .aggregate([
          {
            $match: {
              city: { 
                $all: searchText.split(" ").map((word) => {
                  return new RegExp(word, "i");
                }),
              },
            },
          },
        ])
        .limit(10);
      dataObject2 = dataObject3;
    }

    dataObject = dataObject.concat(dataObject2);
    // cache.set("cities", dataObject);
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
  // }
});

// router.get("/getLocation", logEvent, async (req, res) => {
//   let lat = req.query.lat;
//   let long = req.query.long;
//   const ApiKey = "AIzaSjn79edh7ncj";
//   let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${ApiKey}`;
//   try {
//     const response = await axios.get(url);
//     const data = response.data;
//     if (data.status === "OK") {
//       const address = data.results[0].formatted_address;
//       res.status(200).json({
//         reason: "Location found",
//         statusCode: 200,
//         status: "SUCCESS",
//         dataObject: {
//           address,
//         },
//       });
//     } else {
//       res.status(404).json({
//         reason: "Location not found",
//         statusCode: 404,
//         status: "FAILURE",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json(error);
//   }
// });

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
