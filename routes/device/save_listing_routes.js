const express = require("express");
const router = express.Router();
const moment = require("moment");
const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

const dotenv = require("dotenv");
dotenv.config();

// const FCM = require("fcm-node");
const fetch = require("node-fetch");
const ObjectId = require("mongodb").ObjectId;

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

// router.get("/listing", async (req, res) => {
//   try {
//     const listingId = req.query.userUniqueId;
//     const dataObject = await saveListingModal.findById(listingId);

//     if (!dataObject) {
//       res.status(404).json({ message: "Listing not found" });
//       return;
//     } else {
//       res.status(200).json({
//         reason: "Listing found successfully",
//         statusCode: 200,
//         status: "SUCCESS",
//         dataObject,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// });

router.get("/listings", logEvent, async (req, res) => {
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

router.post("/listing/save", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const userDetails = await createUserModal.find({
    userUniqueId: userUniqueId,
  });
  const mobileNumber = userDetails[0]?.mobileNumber;
  const charger = req.body.charger;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
  const deviceFinalGrade = req.body.deviceFinalGrade;
  const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
  const listedBy = req.body.listedBy;
  const deviceStorage = req.body.deviceStorage;
  const earphone = req.body.earphone;
  const images = req.body.images;
  const imei = req.body.imei;
  const listingLocation = req.body.listingLocation;
  const listingPrice = req.body.listingPrice;
  const make = req.body.make;
  const marketingName = req.body.marketingName;
  // const mobileNumber = req.body.mobileNumber.toString().slice(2, -1);
  const model = req.body.model;
  const originalbox = req.body.originalbox;
  const platform = req.body.platform;
  const recommendedPriceRange = req.body.recommendedPriceRange;
  const deviceImagesAvailable = images.length ? true : false;
  const deviceRam = req.body.deviceRam;

  const now = new Date();
  const dateFormat = moment(now).format("L");

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
    listingPrice,
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
  };

  const modalInfo = new saveListingModal(data);
  try {
    const dataObject = await modalInfo.save();
    res.status(201).json({
      reason: "Listing saved successfully",
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

router.post("/listing/delete", logEvent, async (req, res) => {
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
        await saveListingModal.findOneAndDelete({ listingId: listingId });
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

router.post("/listing/update", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;
  const charger = req.body.charger;
  const color = req.body.color;
  const deviceCondition = req.body.deviceCondition;
  const deviceStorage = req.body.deviceStorage;
  const earphone = req.body.earphone;
  const images = req.body.images;
  const listingLocation = req.body.listingLocation;
  const listingPrice = req.body.listingPrice;
  const originalbox = req.body.originalbox;
  const recommendedPriceRange = req.body.recommendedPriceRange;

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
        };
        if (updateListing?.deviceCondition === deviceCondition) {
          dataToBeUpdate = { ...dataToBeUpdate };
        } else {
          dataToBeUpdate = {
            ...dataToBeUpdate,
            verified: false,
            verifiedDate: "",
          };
        }

        const dataObject = await saveListingModal.findByIdAndUpdate(
          updateListing._id,
          dataToBeUpdate,
          {
            new: true,
          }
        );
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

router.post("/listing/pause", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const pauseListing = await saveListingModal.find({
      listingId: listingId,
    });

    console.log("activateListing", pauseListing);

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
        console.log("pausedListing", pausedListing);
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

router.post("/listing/activate", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const activateListing = await saveListingModal.find({
      listingId: listingId,
    });

    console.log("activateListing", activateListing);

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
        console.log("activatedListing", activatedListing);

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

router.get("/listing/user/mobilenumber", logEvent, async (req, res) => {
  try {
    const userUniqueId = req.query.userUniqueId;
    const listingId = req.query.listingId;

    const isValidUser = await createUserModal.findOne({
      userUniqueId: userUniqueId,
    });

    if (isValidUser) {
      const listing = await saveListingModal.findOne({ listingId: listingId });
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
});

router.get("/listing/detail", logEvent, async (req, res) => {
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

router.post("/listing/updatefordiag", logEvent, async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  const recommendedPriceRange = req.body.recommendedPriceRange;
  const deviceRam = req.body.deviceRam;
  const listingPrice = req.body.listingPrice;
  const deviceCondition = req.body.deviceCondition;
  const images = req.body.images;

  const now = new Date();
  const dateFormat = moment(now).format("L");

  const dataToBeUpdate = {
    // ...req.body,
    verified: true,
    listingDate: dateFormat,
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

        const userFromFavorite = await favoriteModal.find({
          fav_listings: listingId,
        });

        // console.log("userFromFavorite", userFromFavorite);

        const sendNotificationToUser = [];
        userFromFavorite.forEach((item, index) => {
          sendNotificationToUser.push(item.userUniqueId);
        });

        // console.log("sendNotificationToUser", sendNotificationToUser);

        const now = new Date();
        const currentDate = moment(now).format("L");

        const string = await makeRandomString(25);

        let tokenObject = await saveNotificationModel.find({
          userUniqueId: sendNotificationToUser,
        });

        // console.log("tokenObject", tokenObject);

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
            console.log(response);
          })
          .catch(function (error) {
            console.error(error);
          });

        //Save notification to database
        let notificationData = {
          appEventAction: "MY_FAVORITES",
          messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
          notificationId: string,
          createdDate: currentDate,
        };

        console.log("sendNotificationToUser", sendNotificationToUser);

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

router.post("/listing/detailwithuserinfo", logEvent, async (req, res) => {
  const listingid = req.query.listingid;
  const isOtherVendor = req.query.isOtherVendor;
  const userUniqueId = req.query.userUniqueId;

  const VENDORS = {
    6: "Amazon",
    7: "Quikr",
    8: "Cashify",
    9: "2Gud",
    10: "Budli",
    11: "Paytm",
    12: "Yaantra",
    13: "Shopcluse",
    14: "Sahivalue",
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
    if (userUniqueId !== "Guest" && isOtherVendor !== "N") {
      const getFavObject = await favoriteModal.findOne({
        userUniqueId: userUniqueId,
      });

      if (getFavObject) {
        favList = getFavObject.fav_listings;
      } else {
        favList = [];
      }
    }

    console.log("favList", favList);

    // const getListing = await saveListingModal.findOne({
    //   listingId: listingid,
    // });

    let getListing = {};

    if (isOtherVendor === "N") {
      getListing = await saveListingModal.findOne({
        listingId: listingid,
      });
      console.log("getListing from save", getListing);
    } else {
      getThirdsListing = await testScrappedModal.findOne({
        _id: ObjectId(listingid),
      });

      let vendorName = VENDORS[getThirdsListing.vendor_id];
      let vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/vendors/${vendorName
        .toString()
        .toLowerCase()}_logo.png`;

      // let imagePath = await getDefaultImage(element.model_name);
      // console.log("imagePath", imagePath);
      // let imagePath = getImage(element.model_name);
      let imagePath = "";
      let condition = "";

      if (
        getThirdsListing.mobiru_condition.includes("Like New") ||
        getThirdsListing.mobiru_condition.includes("Superb")
      ) {
        condition = "Like New";
      } else if (
        getThirdsListing.mobiru_condition.includes("Excellent") ||
        getThirdsListing.mobiru_condition.includes("Very Good")
      ) {
        condition = "Excellent";
      } else if (getThirdsListing.mobiru_condition.includes("Good")) {
        condition = "Good";
      } else if (getThirdsListing.mobiru_condition.includes("Fair")) {
        condition = "Fair";
      }
      getListing = {
        //   marketingName: element.marketing_name,
        marketingName: getThirdsListing.model_name,
        make: getThirdsListing.model_name.split(" ")[0],
        listingPrice: getThirdsListing.price.toString(),
        deviceStorage:
          getThirdsListing.storage === "0 GB" ||
          getThirdsListing.storage === "--"
            ? "--"
            : getThirdsListing.storage.toString() + " GB",
        warranty: getThirdsListing.warranty,
        vendorLogo: vendorImage,
        vendorLink: getThirdsListing.link ? getThirdsListing.link : "",
        vendorId: getThirdsListing.vendor_id,
        isOtherVendor: "Y",
        imagePath: imagePath,
        verified: false,
        favourite: false,
        listingLocation: "India",
        deviceFinalGrade: null,
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
        },
        images: [],
      };

      console.log("getListing from scrapped", getListing);
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
        getCharger,
        isAppleChargerIncluded,
        getEarphone,
        isAppleEarphoneIncluded,
        gethasOrignalBox,
        getisVarified,
        false
      );

      console.log("price", price);

      let basePrice;
      let notionalPrice;
      const verified_percentage = 10;
      const warranty_percentage1 = 10;
      const warranty_percentage2 = 8;
      const warranty_percentage3 = 5;
      const warranty_percentage4 = 0;
      let has_charger_percentage = 0;
      let has_earphone_percentage = 0;
      const has_original_box_percentage = 3;

      basePrice = price.actualLSP;
      notionalPrice = parseInt(
        getListing.listingPrice.toString().replace(",", "")
      );

      if ("verified" in getListing === true) {
        if (getListing.verified === true) {
          notionalPrice =
            notionalPrice - (basePrice / 100) * verified_percentage;
        }
      }

      if ("charger" in getListing === true) {
        if (getListing.charger === "Y") {
          notionalPrice =
            notionalPrice - (basePrice / 100) * has_charger_percentage;
        }
      }

      if ("earphone" in getListing === true) {
        if (getListing.earphone === "Y") {
          notionalPrice =
            notionalPrice - (basePrice / 100) * has_earphone_percentage;
        }
      }

      if ("originalbox" in getListing === true) {
        if (getListing.originalbox === "Y") {
          notionalPrice =
            notionalPrice - (basePrice / 100) * has_original_box_percentage;
        }
      }

      let currentPercentage;
      currentPercentage = ((basePrice - notionalPrice) / basePrice) * 100;

      console.log("currentPercentage", currentPercentage);
      console.log("basePrice", basePrice);
      console.log("notionalPrice", notionalPrice);

      const externalSource = [];

      let dataObject = { externalSource, ...(getListing._doc || getListing) };
      if (currentPercentage > -3) {
        console.log("getListing", getListing);
        console.log("getListing", getListing?.marketingName);
        console.log("getListing", getListing?.deviceStorage);

        let scrappedModels = await lspModal.find({
          model: getListing?.marketingName,
          storage: [getListing?.deviceStorage, "-- GB"],
          type: "buy",
        });

        console.log("scrappedModels", scrappedModels);

        let selectdModels = [];
        let itemId = "";
        const marketingname = getListing.marketingName;
        const condition = getListing.deviceCondition;
        const storage = getListing.deviceStorage;
        let leastSellingPrice;

        let pushedVendors = [];

        scrappedModels.forEach((item, index) => {
          console.log("model_name", item.model);
          console.log("item storage", item.storage);
          console.log("mobiru_condition", item.condition);

          console.log("marketingname", marketingname);
          console.log("condition", condition);
          console.log("storage", storage);

          if (
            item.model === marketingname &&
            item.condition === condition &&
            item.storage === storage
          ) {
            item.vendor.forEach((vendor) => {
              vendorName = VENDORS[vendor.vendor_id];
              vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/vendors/${vendorName
                .toString()
                .toLowerCase()}_logo.png`;
              let vendorObject = {
                externalSourcePrice: item.lsp,
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

        console.log("externalSource", externalSource);

        if (selectdModels.length > 0) {
          externalSource.push(...selectdModels); //TODO: Need to remove the duplicate objects. Objects from the rarest.
        }
        dataObject = { externalSource, ...(getListing._doc || getListing) };
        let tempArray = [];
        tempArray.push(dataObject);

        // add favorite listings to the final list
        if (userUniqueId !== "Guest" && isOtherVendor !== "N") {
          tempArray.forEach((item, index) => {
            if (favList.includes(item.listingId)) {
              dataObject = { ...dataObject, favourite: true };
            } else {
              dataObject = { ...dataObject, favourite: false };
            }
          });
        }
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
});

router.get("/listing/bydeviceid", logEvent, async (req, res) => {
  const deviceId = req.query.deviceId;
  const userUniqueId = req.query.userUniqueId;

  try {
    // const isValidUser = await createUserModal.find({
    //   userUniqueId: userUniqueId,
    // })

    const getListing = await saveListingModal.findOne({
      deviceUniqueId: deviceId,
      // userUniqueId: userUniqueId,
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
