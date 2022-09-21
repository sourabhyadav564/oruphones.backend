const express = require("express");
const router = express.Router();
const moment = require("moment");

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
// const connection = require("../../src/database/mysql_connection");

const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");
const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

const sendNotification = require("../../utils/push_notification");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const validUser = require("../../src/middleware/valid_user");

router.get(
  "/listing/buyer/verification",
  validUser,
  logEvent,
  async (req, res) => {
    try {
      const listingId = req.query.listingId;
      const mobileNumber = req.query.mobileNumber;

      const getListingObject = await saveRequestModal.findOne({
        mobileNumber: mobileNumber,
        listingId: listingId,
      });

      if (getListingObject) {
        const userUniqueId = getListingObject.userUniqueId;
        const userDetails = await createUserModal.findOne({
          userUniqueId: userUniqueId,
        });

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
  }
);

router.get(
  "/listing/sendverification",
  validUser,
  logEvent,
  async (req, res) => {
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

        if (listingObject.userUniqueId != userUniqueId) {
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

              if (listingObject.userUniqueId != userUniqueId) {
                let sellerUniqueId = listingObject.userUniqueId;
                let marketingName = listingObject.marketingName;
                let sellerName = listingObject.listedBy;
                let sellerContactNumber = listingObject.mobileNumber;
                // let buyerDetails = isValidUser.userName === "" ? isValidUser.mobileNumber : isValidUser.userName;
                const response = await sendNotification(
                  sellerUniqueId,
                  true,
                  marketingName,
                  sellerName,
                  sellerContactNumber
                  // buyerDetails
                );
                const findFavorite = await favoriteModal.findOne({
                  userUniqueId: userUniqueId,
                });

                let addToFavorite = {};
                if (findFavorite && findFavorite.userUniqueId) {
                  addToFavorite = await favoriteModal.findByIdAndUpdate(
                    findFavorite._id,
                    {
                      $push: {
                        fav_listings: listingId,
                      },
                    },
                    { new: true }
                  );
                } else {
                  addToFavorite = await favoriteModal.create({
                    userUniqueId: userUniqueId,
                    fav_listings: [listingId],
                  });
                }
                if (addToFavorite) {
                  res.status(201).json({
                    reason: "Request sent successfully",
                    statusCode: 200,
                    status: "SUCCESS",
                    dataObject,
                  });
                }
              } else {
                res.status(200).json({
                  reason: "You can't send verification request to yourself",
                  statusCode: 202,
                  status: "SUCCESS",
                  dataObject,
                });
              }
            }
          } else {
            res.status(200).json({
              reason:
                "You have already sent verification request for this listing",
              statusCode: 204,
              status: "SUCCESS",
            });
          }
        } else {
          res.status(200).json({
            reason: "You can't send verification request to yourself",
            statusCode: 202,
            status: "SUCCESS",
            dataObject,
          });
        }
      } else {
        res.status(200).json({
          reason: "Invalid user id provided",
          statusCode: 401,
          status: "SUCCESS",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

module.exports = router;
