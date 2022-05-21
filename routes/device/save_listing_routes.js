const express = require("express");
const router = express.Router();
const moment = require("moment");
const saveRequestModal = require("../../src/database/modals/device/request_verification_save");

// require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const scrappedModal = require("../../src/database/modals/others/scrapped_models");
const connection = require("../../src/database/mysql_connection");

const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");

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

router.get("/listings", async (req, res) => {
  try {
    const userUniqueId = req.query.userUniqueId;
    const dataObject = await saveListingModal.find({ userUniqueId });

    if (!dataObject) {
      res.status(404).json({ message: "User unique ID not found" });
      return;
    } else {
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

router.post("/listing/save", async (req, res) => {
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

router.post("/listing/delete", async (req, res) => {
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

router.post("/listing/update", async (req, res) => {
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
        const dataObject = await saveListingModal.findByIdAndUpdate(
          updateListing._id,
          req.body,
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

router.post("/listing/pause", async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const activateListing = await saveListingModal.findOne({
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
      if (activateListing.userUniqueId === userUniqueId) {
        const pausedListing = await saveListingModal.findOneAndUpdate(
          listingId,
          {
            status: "Paused",
          },
          {
            new: true,
          }
        );
        res.status(200).json({
          reason: "Listing paused successfully",
          statusCode: 200,
          status: "SUCCESS",
          pausedListing,
        });
      } else {
        res.status(200).json({
          reason: "You are not authorized to pause this listing",
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

router.post("/listing/activate", async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  try {
    const activateListing = await saveListingModal.findOne({
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
      if (activateListing.userUniqueId === userUniqueId) {
        const activatedListing = await saveListingModal.findOneAndUpdate(
          listingId,
          {
            status: "Active",
          },
          {
            new: true,
          }
        );
        res.status(200).json({
          reason: "Listing activated successfully",
          statusCode: 200,
          status: "SUCCESS",
          activatedListing,
        });
      } else {
        res.status(200).json({
          reason: "You are not authorized to activate this listing",
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

router.get("/listing/user/mobilenumber", async (req, res) => {
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

router.get("/listing/detail", async (req, res) => {
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

router.post("/listing/updatefordiag", async (req, res) => {
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

router.post("/listing/detailwithuserinfo", async (req, res) => {
  const listingid = req.query.listingid;
  const isOtherVendor = req.query.isOtherVendor;
  const userUniqueId = req.query.userUniqueId;

  try {
    // const isValidUser = await createUserModal.find({
    //   userUniqueId: userUniqueId,
    // })

    const getListing = await saveListingModal.findOne({
      listingId: listingid,
    });

    if (!getListing) {
      res.status(200).json({
        reason: "Invalid listing id provided",
        statusCode: 200,
        status: "SUCCESS",
      });
      return;
    } else {
      // let query =
      //   "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 10 day;select * from `web_scraper_model`;";

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
      };

      const externalSource = [];

      let scrappedModels = await scrappedModal.find({
        model_name: getListing?.marketingName,
        storage: getListing?.deviceStorage,
        type: "buy",
      });

      console.log("scrappedModels", scrappedModels);
      console.log("scrappedModel1", getListing?.marketingName);
      console.log("scrappedModel2", getListing?.deviceStorage);

      // connection.query(query, [2, 1], async (err, results, fields) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      // let models = results[1];
      // let scrappedModels = results[0];
      let selectdModels = [];
      // let minPrice;
      // let maxPrice;
      let itemId = "";
      // const make = await getListing.make;
      const marketingname = getListing.marketingName;
      const condition = getListing.deviceCondition;
      const storage = getListing.deviceStorage;
      // .split(" ")[0]
      // .toString();
      let leastSellingPrice;

      // models.forEach((item, index) => {
      //   if (item.name === marketingname) {
      //     itemId = item.id;
      //     return;
      //   }
      // });

      console.log("marketingname", marketingname);
      console.log("condition", condition);
      console.log("storage", storage);

      let pushedVendors = [];

      scrappedModels.forEach((item, index) => {
        console.log("itemId", item);
        if (
          item.model_name === marketingname &&
          item.mobiru_condition === condition &&
          item.storage === storage
        ) {
          console.log("item", item);
          vendorName = VENDORS[item.vendor_id];
          vendorImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/vendors/${vendorName
            .toString()
            .toLowerCase()}_logo.png`;
          let vendorObject = {
            externalSourcePrice: item.price,
            externalSourceImage: vendorImage,
          };
          if (!pushedVendors.includes(vendorName)) {
            console.log("vendorObject", vendorObject);
            selectdModels.push(vendorObject);
            pushedVendors.push(vendorName);
          }
        }
      });

      if (selectdModels.length > 0) {
        // leastSellingPrice = Math.max(...selectdModels);
        externalSource.push(...selectdModels); //TODO: Need to remove the duplicate objects. Objects from the rarest.
      }

      let dataObject = { externalSource, ...getListing._doc };
      // console.log("externalSource", dataObject);

      // if(externalSource.length > 0) {
      res.status(200).json({
        reason: "Listing updated successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
    // }
    // });
    // }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/listing/bydeviceid", async (req, res) => {
  const deviceId = req.query.deviceId;

  try {
    // const isValidUser = await createUserModal.find({
    //   userUniqueId: userUniqueId,
    // })

    const getListing = await saveListingModal.findOne({
      deviceUniqueId: deviceId,
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
