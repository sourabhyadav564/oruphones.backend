const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");

router.post("/save/token", async (req, res) => {
    const notificationInfo = new saveNotificationModel(req.body);
    try {
        const dataObject = await notificationInfo.save();
        res
      .status(201)
      .json({
        reason: "Notification token saved successfully",
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