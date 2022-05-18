const express = require("express");
const router = express.Router();
const moment = require("moment");

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const connection = require("../../src/database/mysql_connection");

const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");
const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

const sendNotification = require("../../utils/push_notification");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");

router.get("/listing/buyer/verification", async (req, res) => {
  try {
    const listingId = req.query.listingId;
    const mobileNumber = req.query.mobileNumber;

    const getListingObject = await saveRequestModal.findOne({
      mobileNumber: mobileNumber,
      listingId: listingId,
    });
    // console.log("getListingObject", getListingObject);

    if (getListingObject) {
      const userUniqueId = getListingObject.userUniqueId;
      const userDetails = await createUserModal.findOne({
        userUniqueId: userUniqueId,
      });
      // console.log("userDetails", userDetails.mobileNumber);

      const isMatchFound = userDetails.mobileNumber === mobileNumber;
      if (!isMatchFound) {
        res.status(200).json({
          reason: "Mobile number not found",
          statusCode: 401,
          status: "UNAUTHORIZED",
        });
        return;
      } else {
        res.status(200).json({
          reason: "Listing found successfully",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    } else {
      res.status(200).json({
        reason: "Mobile number not found",
        statusCode: 401,
        status: "UNAUTHORIZED",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/listing/sendverification", async (req, res) => {
  const listingId = req.query.listingId;
  const userUniqueId = req.query.userUniqueId;

  try {
    const isValidUser = await createUserModal.findOne({
      userUniqueId: userUniqueId,
    });

    const getRequestObject = await saveRequestModal.findOne({
      mobileNumber: isValidUser.mobileNumber,
      listingId: listingId,
    });

    if (isValidUser) {
      const data = {
        listingId: listingId,
        userUniqueId: userUniqueId,
        mobileNumber: isValidUser.mobileNumber,
      };

      if (!getRequestObject) {
        const saveRequest = new saveRequestModal(data);
        let dataObject = await saveRequest.save();

        if (!dataObject) {
          res.status(500).json({
            reason: "Some error occured",
            statusCode: 500,
            status: "SUCCESS",
          });
          return;
        } else {
          let listingObject = await saveListingModal.findOne({
            listingId: listingId,
          });

          if (listingObject) {
            let sellerUniqueId = listingObject.userUniqueId;
            // let tokenObject = saveNotificationModel.find({
            //   userUniqueId: sellerUniqueId,
            // });
            // let notificationTokens = [];
            // tokenObject.forEach((item, index) => {
            //   notificationTokens.push(item.tokenId);
            // });
            const response = await sendNotification(sellerUniqueId, true);
            res.status(201).json({
              reason: "Request sent successfully",
              statusCode: 200,
              status: "SUCCESS",
              dataObject,
            });
          } else {
            res.status(200).json({
              reason: "Listing not found",
              statusCode: 200,
              status: "SUCCESS",
              dataObject,
            });
          }
        }
      } else {
        res.status(200).json({
          reason: "You have already sent verification request for this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    } else {
      res.status(200).json({
        reason: "Invalid user id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
