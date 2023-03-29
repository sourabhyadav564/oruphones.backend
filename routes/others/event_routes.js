const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();

require("../../src/database/connection");
const eventModal = require("../../src/database/modals/others/event_logs");
const appVersionsModal = require("../../src/database/modals/others/app_versions");
const logEvent = require("../../src/middleware/event_logging");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../src/middleware/auth_token");

router.get("/sessionid", async (req, res) => {
  const userUniqueId = req.headers.useruniqueid;
  const eventName = req.headers.eventname;
  const srcFrom = req.headers.srcfrom;
  const sessionId = req.headers.sessionid;
  const devicePlatform = req.headers.deviceplatform;
  const location = req.headers.location;

  try {
    const getEventDocs = await eventModal.findOne({
      sessionId: sessionId,
      userUniqueId: userUniqueId,
    });

    // get app versions by app_versions modal
    const appVersions = await appVersionsModal.findOne();
    // console.log("appVersions", appVersions);

    // const payload = {
    //   srcFrom: srcFrom,
    // };
    // const accessToken = generateAccessToken(payload);
    // const refreshToken = generateRefreshToken(payload);

    if (getEventDocs) {
      res.status(200).json({
        reason: "Session already exist",
        statusCode: 200,
        status: "SUCCESS",
      });
    } else {
      const headerInfo = {
        userUniqueId: userUniqueId,
        events: {
          eventName: eventName,
        },
        srcFrom: srcFrom,
        sessionId: sessionId,
        // accessToken: accessToken,
        // refreshToken: refreshToken,
        devicePlatform: devicePlatform,
        location: location,
      };
      const eventModalObject = new eventModal(headerInfo);
      let dataObject = await eventModalObject.save();

      // add appVersions in dataObject
      dataObject = { ...dataObject._doc, appVersions };

      res.status(201).json({
        reason: "Session created successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
