const express = require("express");
const router = express.Router();
const logEvent = require("../../src/middleware/event_logging");

require("../../src/database/connection");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");
const sendNotification = require("../../utils/push_notification");
const notificationModel = require("../../src/database/modals/notification/complete_notifications");
const validUser = require("../../src/middleware/valid_user");

router.post("/save/token", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const deviceId = req.body.deviceId;
  const tokenId = req.body.tokenId;

  try {
    const findDevice = await saveNotificationModel.find({
      deviceId: deviceId,
      userUniqueId: userUniqueId,
    });
    if (findDevice.length > 0) {
      const updateDocument = await saveNotificationModel.findByIdAndUpdate(
        findDevice._id,
        { tokenId: tokenId },
        {
          new: true,
        }
      );
      res.status(201).json({
        reason: "Notification token updated successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject: updateDocument,
      });
    } else {
      const notification_data = {
        userUniqueId: userUniqueId,
        deviceId: deviceId,
        tokenId: tokenId,
      };
      const notificationInfo = new saveNotificationModel(notification_data);
      const dataObject = await notificationInfo.save();
      res.status(201).json({
        reason: "Notification token saved successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/delete/token", validUser, logEvent, async (req, res) => {
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

router.get("/byUserId/:uuid", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.params.uuid;

  try {
    let notificationArray = await notificationModel.findOne({
      userUniqueId: userUniqueId,
    });

    let dataToBeSend = {};
    let unReadCount = 0;
    if (notificationArray) {
      notificationArray.notification.reverse();
      notificationArray?.notification?.forEach((element, index) => {
        if (element.isUnRead === 0) {
          unReadCount++;
        }
      });
      dataToBeSend = {
        unReadCount,
        notifications: notificationArray?.notification,
      };
      res.status(201).json({
        reason: "Notification fetched successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject: dataToBeSend,
      });
    } else {
      dataToBeSend = {
        unReadCount: 0,
        notifications: [],
      };
      res.status(202).json({
        reason: "No notification found",
        statusCode: 202,
        status: "SUCCESS",
        dataObject: dataToBeSend,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/read", validUser, logEvent, async (req, res) => {
  const notificationId = req.query.id;
  const userUniqueId = req.query.userUniqueId;

  try {
    const notification = await notificationModel.findOne({
      userUniqueId: userUniqueId,
      notification: {
        $elemMatch: {
          notificationId: notificationId,
        },
      },
    });
    if (!notification) {
      res.status(202).json({
        reason: "Notification not found",
        statusCode: 202,
        status: "ACCEPTED",
      });
      return;
    }
    const notificationIndex = notification.notification.findIndex(
      (element) => element.notificationId === notificationId
    );
    notification.notification[notificationIndex].isUnRead = 1;
    const updatedNotification = await notification.save();
    res.status(200).json({
      reason: "Notification read successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: updatedNotification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/remove", validUser, logEvent, async (req, res) => {
  const notificationId = req.query.id;
  const userUniqueId = req.query.userUniqueId;

  try {
    const notification = await notificationModel.findOne({
      userUniqueId: userUniqueId,
      notification: {
        $elemMatch: {
          notificationId: notificationId,
        },
      },
    });
    if (!notification) {
      res.status(202).json({
        reason: "Notification not found",
        statusCode: 202,
        status: "ACCEPTED",
      });
      return;
    }
    const notificationIndex = notification.notification.findIndex(
      (element) => element.notificationId === notificationId
    );
    notification.notification.splice(notificationIndex, 1);
    const updatedNotification = await notification.save();
    res.status(200).json({
      reason: "Notification removed successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: updatedNotification,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
