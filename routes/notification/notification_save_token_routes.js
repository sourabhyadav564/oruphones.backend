const express = require("express");
const router = express.Router();
const logEvent = require("../../src/middleware/event_logging");

require("../../src/database/connection");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");

router.post("/save/token", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const deviceId = req.body.deviceId;
  const tokenId = req.body.tokenId;

  const notification_data = {
    userUniqueId: userUniqueId,
    deviceId: deviceId,
    tokenId: tokenId,
  }

  console.log("first", notification_data);
  const notificationInfo = new saveNotificationModel(notification_data);
  try {
    const dataObject = await notificationInfo.save();
    res.status(201).json({
      reason: "Notification token saved successfully",
      statusCode: 201,
      status: "SUCCESS",
      dataObject,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/delete/token", async (req, res) => {
  const tokenId = req.body.tokenId;
  const deviceId = req.body.deviceId;
  const userUniqueId = req.body.userUniqueId;

  try {
    const deleteNotification = await saveNotificationModel.findOneAndDelete(
      tokenId
    );

    if (!deleteNotification) {
      res.status(202).json({
        reason: "Notification not found",
        statusCode: 202,
        status: "ACCEPTED",
      });
      return;
    } else {
      res.status(200).json({
        reason: "Notification deleted successfully",
        statusCode: 200,
        status: "SUCCESS",
        deletedNotification: deleteNotification,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
