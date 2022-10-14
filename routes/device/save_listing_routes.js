const express = require("express");
const router = express.Router();
const moment = require("moment");
const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

const dotenv = require("dotenv");
dotenv.config();

// const FCM = require("fcm-node");
const fetch = require("node-fetch");
const ObjectId = require("mongodb").ObjectId;

const fs = require("fs");
const path = require("path");

// require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const scrappedModal = require("../../src/database/modals/others/scrapped_models");
const favoriteModal = require("../../src/database/modals/favorite/favorite_add");
const scrappedExternalSourceModal = require("../../src/database/modals/others/scrapped_for_external_source_models");
// const connection = require("../../src/database/mysql_connection");

const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const saveNotificationModel = require("../../src/database/modals/notification/notification_save_token");
const notificationModel = require("../../src/database/modals/notification/complete_notifications");
const makeRandomString = require("../../utils/generate_random_string");
const lspModal = require("../../src/database/modals/others/new_scrapped_models");
const testScrappedModal = require("../../src/database/modals/others/test_scrapped_models");

const cityModal = require("../../src/database/modals/global/cities_modal");

const allMatrix = require("../../utils/matrix_figures");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
const validUser = require("../../src/middleware/valid_user");
const downloadImage = require("../../utils/download_image_from_url");

router.get("/listings", validUser, logEvent, async (req, res) => {
  try {
    const userUniqueId = req.query.userUniqueId;
    let dataObject = await saveListingModal.find({ userUniqueId });

    if (!dataObject) {
      res.status(404).json({ message: "User unique ID not found" });
      return;
    } else {
      dataObject.reverse();
      res.status(200).json({
        reason: "Listings found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/listing/save", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listedBy = req.body.listedBy;
  const userDetails = await createUserModal.findOne({
    userUniqueId: userUniqueId,
  });

  if (userDetails) {
    if (userDetails?.userName?.length === 0) {
      const userName = listedBy;
      const dataToBeUpdate = {
        userName: userName,
      };
      let data = await createUserModal.findByIdAndUpdate(
        userDetails._id,
        dataToBeUpdate,
        {
          new: true,
        }
      );
    } else if (userDetails?.userName == null) {
      const userName = listedBy;
      const dataToBeUpdate = {
        userName: userName,
      };
      let data = await createUserModal.findByIdAndUpdate(
        userDetails._id,
        dataToBeUpdate,
        {
          new: true,
        }
      );
    }
  }

  const mobileNumber = userDetails?.mobileNumber;
  const charger = req.body.charger;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
  const deviceFinalGrade = req.body.deviceFinalGrade;
  const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
  const deviceStorage = req.body.deviceStorage;
  const earphone = req.body.earphone;
  const images = req.body.images;
  const imei = req.body.imei;
  let listingLocation = req.body.listingLocation;
  const listingPrice = req.body.listingPrice;
  const make = req.body.make;
  const marketingName = req.body.marketingName;
  // const mobileNumber = req.body.mobileNumber.toString().slice(2, -1);
  const model = req.body.model;
  const originalbox = req.body.originalbox;
  const platform = req.body.platform;
  const recommendedPriceRange = req.body.recommendedPriceRange;
  const deviceImagesAvailable = images.length > 0 ? true : false;
  const deviceRam = req.body.deviceRam;
  let deviceWarranty = req.body.warranty;

  const cosmetic = req.body.cosmetic;

  let getLocation = await cityModal.findOne({ city: listingLocation });
  if (getLocation) {
    listingLocation = getLocation.city;
  } else {
    await cityModal.create({ city: listingLocation, displayWithImage: "0" });
  }

  switch (deviceWarranty) {
    case "zero":
      deviceWarranty = "More than 9 months";
      break;
    case "four":
      deviceWarranty = "More than 6 months";
      break;
    case "seven":
      deviceWarranty = "More than 3 months";
      break;
    case "more":
      deviceWarranty = "None";
      break;
    default:
      deviceWarranty = "None";
  }

  const now = new Date();
  // const dateFormat = moment(now).format("L");
  const dateFormat = moment(now).format("MMM Do");

  //TODO - Add the exact default image as the model image
  //   const defaultImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make.toString().toLowerCase()}/mbr_Apple_iPhone_12_mini.png`

  const image = await getDefaultImage(marketingName);

  // const defaultImage = {
  //   fullImage: `https://zenrodeviceimages.s3-us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make.toString().toLowerCase()}/mbr_${marketingName.toLowerCase().replace(" ", "_")}.png`
  // }

  const defaultImage = {
    fullImage: image,
  };

  const data = {
    charger,
    color,
    deviceCondition,
    deviceCosmeticGrade,
    deviceFinalGrade,
    deviceFunctionalGrade,
    listedBy,
    deviceStorage,
    earphone,
    images,
    imei,
    listingLocation,
    listingPrice: parseInt(listingPrice.toString()),
    make,
    marketingName,
    mobileNumber,
    model,
    originalbox,
    platform,
    recommendedPriceRange,
    userUniqueId,
    deviceImagesAvailable,
    defaultImage,
    deviceRam,
    listingDate: dateFormat,
    warranty: deviceWarranty,
    cosmetic,
  };

  try {
    const modalInfo = new saveListingModal(data);
    const dataObject = await modalInfo.save();

    let newData = {
      ...data,
      notionalPercentage: -999999,
      imagePath:
        (defaultImage.fullImage != "" ? defaultImage.fullImage : "") ||
        (images.length > 0 ? images[0].fullImage : ""),
      listingId: dataObject.listingId,
      listingDate: moment(now).format("MMM Do"),
    };

    const tempModelInfo = new bestDealsModal(newData);
    const tempDataObject = await tempModelInfo.save();

    res.status(201).json({
      reason: "Listing saved successfully",
      statusCode: 201,
      status: "SUCCESS",
      dataObject: dataObject,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/listing/delete", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const updateListing = await saveListingModal.findOne({
      listingId: listingId,
    });

    if (!updateListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      if (updateListing.userUniqueId === userUniqueId) {
        const deleletedListing = await saveListingModal.findOneAndDelete({
          listingId: listingId,
        });
        // const updatedListings = await bestDealsModal.findByIdAndUpdate(
        //   updatedListings.listingId,
        //   {
        //     status: "Sold_Out",
        //   },
        //   {
        //     new: true,
        //   }
        // );
        // console.log("updatedListings", updatedListings);
        const updatedListings = await bestDealsModal.findOne({
          listingId: deleletedListing.listingId,
        });
        if (updatedListings) {
          updatedListings.status = "Sold_Out";
          updatedListings.save();
        }
        res.status(200).json({
          reason: "Listing deleted successfully",
          statusCode: 200,
          status: "SUCCESS",
          updateListing,
        });
      } else {
        res.status(200).json({
          reason: "You are not authorized to delete this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/listing/update", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;
  const charger = req.body.charger;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceStorage = req.body.deviceStorage;
  const deviceRam = req.body.deviceRam;
  const earphone = req.body.earphone;
  const images = req.body.images;
  const listingLocation = req.body.listingLocation;
  const listingPrice = req.body.listingPrice;
  const originalbox = req.body.originalbox;
  const recommendedPriceRange = req.body.recommendedPriceRange;
  const cosmetic = req.body.cosmetic;
  let warranty = req.body.warranty;

  try {
    const updateListing = await saveListingModal.findOne({
      listingId: listingId,
    });

    if (!updateListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      switch (warranty) {
        case "zero":
          warranty = "More than 9 months";
          break;
        case "four":
          warranty = "More than 6 months";
          break;
        case "seven":
          warranty = "More than 3 months";
          break;
        case "more":
          warranty = "None";
          break;
        default:
          warranty = "None";
      }

      if (updateListing.userUniqueId === userUniqueId) {
        let dataToBeUpdate = {
          charger,
          color,
          deviceCondition,
          earphone,
          images,
          listingLocation,
          listingPrice,
          originalbox,
          recommendedPriceRange,
          deviceStorage,
          deviceRam,
          cosmetic : cosmetic == {} ? updateListing.cosmetic : cosmetic,
          warranty,
        };
        if (updateListing?.deviceCondition === deviceCondition) {
          dataToBeUpdate = { ...dataToBeUpdate };
        } else {
          dataToBeUpdate = {
            ...dataToBeUpdate,
            verified: false,
            verifiedDate: "",
            functionalTestResults: [],
          };
        }

        const dataObject = await saveListingModal.findByIdAndUpdate(
          updateListing._id,
          dataToBeUpdate,
          {
            new: true,
          }
        );
        const updatedListings = await bestDealsModal.findOne({
          listingId: dataObject.listingId,
        });
        if (updatedListings) {
          updatedListings.charger = charger;
          updatedListings.color = color;
          updatedListings.deviceCondition = deviceCondition;
          updatedListings.earphone = earphone;
          updatedListings.images = images;
          updatedListings.listingLocation = listingLocation;
          updatedListings.listingPrice = listingPrice;
          updatedListings.originalbox = originalbox;
          updatedListings.recommendedPriceRange = recommendedPriceRange;
          updatedListings.deviceStorage = deviceStorage;
          updatedListings.deviceRam = deviceRam;
          updatedListings.cosmetic = cosmetic == {} ? updateListing.cosmetic : cosmetic;
          updatedListings.warranty = warranty;
          updatedListings.verified =
            updateListing?.deviceCondition === deviceCondition
              ? updatedListings.verified
              : false;
          updatedListings.verifyDate =
            updateListing?.deviceCondition === deviceCondition
              ? updatedListings.verifyDate
              : "";
          updatedListings.functionalTestResults =
            updateListing?.deviceCondition === deviceCondition
              ? updatedListings.functionalTestResults
              : [];
          updatedListings.save();
        }
        res.status(200).json({
          reason: "Listing updated successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject,
        });
      } else {
        res.status(200).json({
          reason: "You are not authorized to update this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/listing/pause", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const pauseListing = await saveListingModal.find({
      listingId: listingId,
    });

    if (!pauseListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      if (pauseListing[0]?.userUniqueId !== userUniqueId) {
        res.status(200).json({
          reason: "You are not authorized to pause this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      } else {
        const pausedListing = await saveListingModal.findByIdAndUpdate(
          pauseListing[0]?._id,
          {
            status: "Paused",
          },
          {
            new: true,
          }
        );
        // update bestdealmodel status
        const updatedListings = await bestDealsModal.findOne({
          listingId: pausedListing.listingId,
        });
        if (updatedListings) {
          updatedListings.status = "Sold_Out";
          updatedListings.save();
        }

        res.status(200).json({
          reason: "Listing paused successfully",
          statusCode: 200,
          status: "SUCCESS",
          pausedListing,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/listing/activate", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const activateListing = await saveListingModal.find({
      listingId: listingId,
    });

    if (!activateListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      if (activateListing[0].userUniqueId !== userUniqueId) {
        res.status(200).json({
          reason: "You are not authorized to activate this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      } else {
        const activatedListing = await saveListingModal.findByIdAndUpdate(
          activateListing[0]?._id,
          {
            status: "Active",
          },
          {
            new: true,
          }
        );

        // update bestdealmodel status
        const updatedListings = await bestDealsModal.findOne({
          listingId: activatedListing.listingId,
        });
        if (updatedListings) {
          updatedListings.status = "Active";
          updatedListings.save();
        }

        res.status(200).json({
          reason: "Listing activated successfully",
          statusCode: 200,
          status: "SUCCESS",
          activatedListing,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get(
  "/listing/user/mobilenumber",
  validUser,
  logEvent,
  async (req, res) => {
    try {
      const userUniqueId = req.query.userUniqueId;
      const listingId = req.query.listingId;

      const isValidUser = await createUserModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (isValidUser) {
        const listing = await saveListingModal.findOne({
          listingId: listingId,
        });
        const mobileNumber = listing.mobileNumber;

        const getListingObject = await saveRequestModal.findOne({
          mobileNumber: mobileNumber,
          listingId: listingId,
        });

        if (!getListingObject) {
          const data = {
            listingId: listingId,
            userUniqueId: userUniqueId,
            mobileNumber: isValidUser.mobileNumber,
          };

          const saveRequest = new saveRequestModal(data);
          let savedData = await saveRequest.save();

          const dataObject = {
            mobileNumber,
          };

          res.status(200).json({
            reason: "Mobile number retrieved successfully",
            statusCode: 200,
            status: "SUCCESS",
            dataObject,
          });
        } else {
          const dataObject = {
            mobileNumber,
          };

          res.status(200).json({
            reason: "Mobile number retrieved again",
            statusCode: 200,
            status: "SUCCESS",
            dataObject,
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
  }
);

router.get("/listing/detail", validUser, logEvent, async (req, res) => {
  try {
    const userUniqueId = req.query.userUniqueId;
    const listingId = req.query.listingid;

    // const isValidUser = await createUserModal.find({
    //   userUniqueId: userUniqueId,
    // });
    const validListing = await saveListingModal.findOne({
      listingId: listingId,
      userUniqueId: userUniqueId,
    });

    if (validListing) {
      const dataObject = validListing;
      res.status(200).json({
        reason: "Listing found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
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

router.post("/listing/updatefordiag", validUser, logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  const recommendedPriceRange = req.body.recommendedPriceRange;
  const deviceRam = req.body.deviceRam;
  const listingPrice = req.body.listingPrice;
  const deviceCondition = req.body.deviceCondition;
  const images = req.body.images;

  const now = new Date();
  const dateFormat = moment(now).format("MMM Do");

  const dataToBeUpdate = {
    // ...req.body,
    verified: true,
    // listingDate: dateFormat,
    verifiedDate: dateFormat,
    recommendedPriceRange: recommendedPriceRange,
    deviceRam: deviceRam,
    listingPrice: listingPrice,
    deviceCondition: deviceCondition,
    images: images,
  };

  try {
    const updateListing = await saveListingModal.findOne({
      listingId: listingId,
    });

    if (!updateListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      if (updateListing.userUniqueId === userUniqueId) {
        let dataObject = await saveListingModal.findByIdAndUpdate(
          updateListing._id,
          dataToBeUpdate,
          {
            new: true,
          }
        );

        await bestDealsModal.findOneAndUpdate(
          { listingId: dataObject.listingId },
          dataToBeUpdate,
          {
            new: true,
          }
        );

        const userFromFavorite = await favoriteModal.find({
          fav_listings: listingId,
        });

        const sendNotificationToUser = [];
        userFromFavorite.forEach((item, index) => {
          sendNotificationToUser.push(item.userUniqueId);
        });

        const now = new Date();
        const currentDate = moment(now).format("MMM Do");

        const string = await makeRandomString(25);

        let tokenObject = await saveNotificationModel.find({
          userUniqueId: sendNotificationToUser,
        });

        let notificationTokens = [];
        tokenObject.forEach((item, index) => {
          notificationTokens.push(item.tokenId);
        });

        var notification_body = {
          registration_ids: notificationTokens,
          notification: {
            title: `Congratulations!!!`,
            body: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
            sound: "default",
            //   click_action: "FCM_PLUGIN_ACTIVITY",
            icon: "fcm_push_icon",
          },
          data: {
            title: `Congratulations!!!`,
            body: {
              source: "ORU Phones",
              messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
            },
            appEventAction: "MY_FAVORITES",
            webEventAction: "MY_FAVORITES",
          },
        };

        fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            // replace authorization key with your key
            Authorization: "key=" + process.env.FCM_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notification_body),
        })
          .then(function (response) {
            // console.log(response);
          })
          .catch(function (error) {
            console.error(error);
          });

        //Save notification to database
        let notificationData = {
          appEventAction: "MY_FAVORITES",
          webEventAction: "MY_FAVORITES",
          messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
          notificationId: string,
          createdDate: currentDate,
        };

        sendNotificationToUser.forEach(async (user, index) => {
          let dataToBeSave = {
            userUniqueId: user,
            notification: [notificationData],
          };

          const notificationObject = await notificationModel.findOne({
            userUniqueId: user,
          });

          if (!notificationObject) {
            const saveNotification = new notificationModel(dataToBeSave);
            let dataObject = await saveNotification.save();
          } else {
            const updateNotification =
              await notificationModel.findByIdAndUpdate(
                notificationObject._id,
                { $push: { notification: notificationData } },
                { new: true }
              );
          }
        });

        res.status(200).json({
          reason: "Listing updated successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject,
        });
      } else {
        res.status(200).json({
          reason: "You are not authorized to update this listing",
          statusCode: 200,
          status: "SUCCESS",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post(
  "/listing/detailwithuserinfo",
  validUser,
  logEvent,
  async (req, res) => {
    const listingid = req.query.listingid;
    const isOtherVendor = req.query.isOtherVendor;
    const userUniqueId = req.query.userUniqueId;

    // let testScrappedModalData = await testScrappedModal.find({
    //   type: 'sell',
    //   vendor_id: 8
    // });

    const VENDORS = {
      6: "Amazon",
      7: "Quikr",
      8: "Cashify",
      9: "2Gud",
      10: "Budli",
      11: "Paytm",
      12: "Yaantra",
      13: "Sahivalue",
      14: "Shopcluse",
      15: "Xtracover",
      16: "Mobigarage",
      17: "Instacash",
      18: "Cashforphone",
      19: "Recycledevice",
      20: "Quickmobile",
      21: "mbr_Buyblynk",
      22: "mbr_Electronicbazaar",
      23: "Flipkart",
    };

    try {
      // const isValidUser = await createUserModal.find({
      //   userUniqueId: userUniqueId,
      // })

      let favList = [];
      if (userUniqueId != "Guest" && isOtherVendor != "Y") {
        const getFavObject = await favoriteModal.findOne({
          userUniqueId: userUniqueId,
        });

        if (getFavObject) {
          favList = getFavObject.fav_listings;
        } else {
          favList = [];
        }
      }

      // const getListing = await saveListingModal.findOne({
      //   listingId: listingid,
      // });

      let getListing = {};

      if (isOtherVendor === "N") {
        getListing = await saveListingModal.findOne({
          listingId: listingid,
        });
        if (!getListing) {
          getListing = await bestDealsModal.findOne({
            listingId: listingid,
          });
        }
      } else {
        getThirdsListing = await testScrappedModal.findOne({
          _id: ObjectId(listingid),
          type: "buy",
        });

        let vendorName = VENDORS[getThirdsListing.vendor_id];
        let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
          .toString()
          .toLowerCase()}_logo.png`;

        // let imagePath = await getDefaultImage(element.model_name);
        // let imagePath = getImage(element.model_name);
        let imagePath = "";
        let condition = getThirdsListing.mobiru_condition;

        getListing = {
          //   marketingName: element.marketing_name,
          marketingName:
            getThirdsListing.model_name == null
              ? "--"
              : getThirdsListing.model_name,
          make:
            getThirdsListing.model_name == null
              ? "--"
              : getThirdsListing.model_name.split(" ")[0],
          listingPrice:
            getThirdsListing.price == null
              ? "--"
              : getThirdsListing.price.toString(),
          deviceStorage:
            getThirdsListing.storage === "0 GB" ||
            getThirdsListing.storage === "--" ||
            getThirdsListing.storage == null
              ? "--"
              : `${getThirdsListing.storage} GB`,
          deviceRam:
            getThirdsListing.ram === "0 GB" ||
            getThirdsListing.ram === "--" ||
            getThirdsListing.ram == null
              ? "--"
              : `${getThirdsListing.ram} GB`,
          warranty: getThirdsListing.warranty,
          vendorLogo: vendorImage,
          vendorLink: getThirdsListing.link ? getThirdsListing.link : "",
          vendorId: getThirdsListing.vendor_id,
          isOtherVendor: "Y",
          imagePath: imagePath,
          verified: false,
          favourite: false,
          listingLocation: "India",
          deviceFinalGrade: " ",
          deviceCosmeticGrade: " ",
          deviceFunctionalGrade: " ",
          imei: " ",
          model:
            getThirdsListing.model_name == null
              ? "--"
              : getThirdsListing.model_name,
          deviceCondition: condition,
          listingId: getThirdsListing._id,
          listingDate: "",
          modifiedDate: "",
          verifiedDate: "",
          charger: "Y",
          earphone: "Y",
          originalbox: "Y",
          defaultImage: {
            fullImage: "",
            // fullImage: imagePath,
          },
          // images: [{
          //   fullImage: imagePath,
          //   thumbnailImage: imagePath,
          // }]
          images: [],
          status: "Active",
        };
      }

      if (!getListing) {
        res.status(200).json({
          reason: "Invalid listing id provided",
          statusCode: 200,
          status: "SUCCESS",
        });
        return;
      } else {
        let getMake = getListing?.make;
        let getMarketingName = getListing?.marketingName;
        let getCondition = getListing?.deviceCondition;
        let getStorage = getListing?.deviceStorage;
        let getRam = getListing?.deviceRam;
        let getCharger = getListing?.charger === "Y" ? true : false;
        let isAppleChargerIncluded =
          getCharger?.make === "Apple" ? getCharger : false;
        let getEarphone = getListing?.earphone === "Y" ? true : false;
        let isAppleEarphoneIncluded =
          getEarphone?.make === "Apple" ? getEarphone : false;
        let gethasOrignalBox = getListing?.originalbox === "Y" ? true : false;
        let getisVarified = getListing?.verified;

        const price = await getRecommendedPrice(
          getMake,
          getMarketingName,
          getCondition,
          getStorage,
          getRam,
          getCharger,
          isAppleChargerIncluded,
          getEarphone,
          isAppleEarphoneIncluded,
          gethasOrignalBox,
          getisVarified,
          false
        );

        let basePrice;
        let notionalPrice;
        // const verified_percentage = 10;
        // const warranty_percentage1 = 10;
        // const warranty_percentage2 = 8;
        // const warranty_percentage3 = 5;
        // const warranty_percentage4 = 0;
        // let has_charger_percentage = 0;
        // let has_earphone_percentage = 0;
        // const has_original_box_percentage = 3;

        const warranty_percentage1 =
          allMatrix.bestDealFigures.warranty_percentage1;
        const warranty_percentage2 =
          allMatrix.bestDealFigures.warranty_percentage2;
        const warranty_percentage3 =
          allMatrix.bestDealFigures.warranty_percentage3;
        // const warranty_percentage2 = 8;
        // const warranty_percentage3 = 5;
        // const warranty_percentage4 = 0;
        let has_charger_percentage =
          allMatrix.bestDealFigures.has_non_apple_charger_percentage;
        let has_earphone_percentage =
          allMatrix.bestDealFigures.has_non_apple_earphone_percentage;
        const has_original_box_percentage =
          allMatrix.bestDealFigures.has_original_box_percentage;
        const third_party_warranty_percentage =
          allMatrix.bestDealFigures.third_party_warranty_percentage;

        // let deduction = 0;
        // basePrice = price.actualLSP;
        // notionalPrice = parseInt(
        //   getListing.listingPrice.toString().replace(",", "")
        // );

        // // if ("verified" in getListing === true) {
        // //   if (getListing.verified === true) {
        // //     notionalPrice =
        // //       notionalPrice - (basePrice / 100) * verified_percentage;
        // //   }
        // // }

        // if ("charger" in getListing === true) {
        //   if (getListing.charger === "Y") {
        //     // notionalPrice =
        //     //   notionalPrice - (basePrice / 100) * has_charger_percentage;
        //     deduction = deduction + has_charger_percentage;
        //   }
        // }

        // if ("earphone" in getListing === true) {
        //   if (getListing.earphone === "Y") {
        //     deduction = deduction + has_earphone_percentage;
        //     // notionalPrice =
        //     //   notionalPrice - (basePrice / 100) * has_earphone_percentage;
        //   }
        // }

        // if ("originalbox" in getListing === true) {
        //   if (getListing.originalbox === "Y") {
        //     // notionalPrice =
        //     //   notionalPrice - (basePrice / 100) * has_original_box_percentage;
        //     deduction = deduction + has_original_box_percentage;
        //   }
        // }

        // let currentPercentage;
        // currentPercentage = ((basePrice - notionalPrice) / basePrice) * 100;

        let deduction = 0;
        basePrice = price.actualLSP;
        notionalPrice = parseInt(
          getListing.listingPrice.toString().replace(",", "")
        );

        if ("charger" in getListing === true) {
          if (getListing.charger === "N") {
            deduction = deduction + has_charger_percentage;
            // notionalPrice =
            // notionalPrice + (basePrice / 100) * has_charger_percentage;
          }
        }

        if ("earphone" in getListing === true) {
          if (getListing.earphone === "N") {
            deduction = deduction + has_earphone_percentage;
            // notionalPrice =
            //   notionalPrice + (basePrice / 100) * has_earphone_percentage;
          }
        }

        if ("originalbox" in getListing === true) {
          if (getListing.originalbox === "N") {
            deduction = deduction + has_original_box_percentage;
            // notionalPrice =
            //   notionalPrice + (basePrice / 100) * has_original_box_percentage;
          }
        }

        notionalPrice = notionalPrice - (basePrice / 100) * deduction;

        let testScrappedModalData = await testScrappedModal.find({
          type: "sell",
          vendor_id: 8,
          make: getMake,
          model_name: getMarketingName,
          storage: parseInt(getStorage.toString().split(" ")[0].toString()),
        });

        let getCashifyListingList = testScrappedModalData.filter((item) => {
          if (
            item.model_name === getMarketingName &&
            item.make === getMake &&
            item.storage ===
              parseInt(getStorage.toString().split(" ")[0].toString()) &&
            item.type === "sell" &&
            item.vendor_id === 8
          ) {
            return item;
          }
        });

        let getCashifyListing = getCashifyListingList[0];

        if (
          "warranty" in getListing == true &&
          getListing.isOtherVendor === "N"
        ) {
          let cashify_upto_price = 0;

          if (getCashifyListing) {
            cashify_upto_price = getCashifyListing.price;

            let warrantyWeight = 0;
            const warranty = item.warranty;

            if (warranty == "0 - 3 Months") {
              warrantyWeight = warranty_percentage1;
            } else if (warranty == "4 - 6 Months") {
              warrantyWeight = warranty_percentage2;
            } else if (warranty == "7 - 11 Months") {
              warrantyWeight = warranty_percentage3;
            }

            notionalPrice =
              notionalPrice - (cashify_upto_price / 100) * warrantyWeight;
          }
        }

        let thirdPartyDeduction =
          has_charger_percentage +
          has_earphone_percentage +
          has_original_box_percentage +
          third_party_warranty_percentage;

        let newBasePrice = basePrice - (basePrice / 100) * thirdPartyDeduction;

        let currentPercentage;
        currentPercentage =
          ((newBasePrice - notionalPrice) / newBasePrice) * 100;

        const externalSource = [];

        let dataObject = { externalSource, ...(getListing._doc || getListing) };
        if (currentPercentage > -3) {
          let scrappedModels = await lspModal.find({
            model: getListing?.marketingName,
            storage: [getListing?.deviceStorage, "-- GB"],
            type: "buy",
          });

          let selectdModels = [];
          let itemId = "";
          const marketingname = getListing.marketingName;
          const condition = getListing.deviceCondition;
          const storage = getListing.deviceStorage;
          let leastSellingPrice;

          let pushedVendors = [];

          scrappedModels.forEach((item, index) => {
            if (
              item.model === marketingname &&
              item.condition === condition &&
              item.storage === storage
            ) {
              item.vendor.forEach((vendor) => {
                // console.log("vendor", vendor);
                vendorName = VENDORS[vendor.vendor_id];
                vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
                  .toString()
                  .toLowerCase()}_logo.png`;
                let vendorObject = {
                  externalSourcePrice: vendor.price,
                  externalSourceImage: vendorImage,
                };
                if (!pushedVendors.includes(vendorName)) {
                  if (
                    getListing?.vendorLogo != vendorObject.externalSourceImage
                  ) {
                    selectdModels.push(vendorObject);
                    pushedVendors.push(vendorName);
                  }
                }
              });
            }
          });

          if (selectdModels.length > 0) {
            externalSource.push(...selectdModels);
            //TODO: Need to remove the duplicate objects. Objects from the rarest.
          }
          dataObject = { externalSource, ...(getListing._doc || getListing) };
          let tempArray = [];
          tempArray.push(dataObject);

          // add favorite listings to the final list
          if (userUniqueId != "Guest" && isOtherVendor != "Y") {
            tempArray.forEach((item, index) => {
              if (favList.includes(item.listingId)) {
                dataObject = { ...dataObject, favourite: true };
              } else {
                dataObject = { ...dataObject, favourite: false };
              }
            });
          }
        }
        // Remove mobileNumber from the response
        if (dataObject.mobileNumber) {
          delete dataObject.mobileNumber;
        }

        res.status(200).json({
          reason: "Listing found successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.get("/listing/bydeviceid", validUser, logEvent, async (req, res) => {
  const deviceId = req.query.deviceId;
  const userUniqueId = req.query.userUniqueId;

  try {
    // const isValidUser = await createUserModal.find({
    //   userUniqueId: userUniqueId,
    // })

    const getListing = await saveListingModal.findOne({
      deviceUniqueId: deviceId,
      userUniqueId: userUniqueId,
      verified: true,
    });

    if (!getListing) {
      res.status(200).json({
        reason: "Invalid device id provided",
        statusCode: 200,
        status: "INVALID",
        dataObject: {},
      });
      return;
    } else {
      res.status(200).json({
        reason: "Listing found successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: getListing,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
