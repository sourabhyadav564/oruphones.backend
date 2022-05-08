const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const createUserModal = require("../../src/database/modals/login/login_create_user");

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
  const mobileNumber = req.body.mobileNumber.toString().slice(2, -1);
  const model = req.body.model;
  const originalbox = req.body.originalbox;
  const platform = req.body.platform;
  const recommendedPriceRange = req.body.recommendedPriceRange;
  const userUniqueId = req.body.userUniqueId;
  const deviceImagesAvailable = images.length ? true : false;

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

    const isValidUser = await createUserModal.find({
      userUniqueId: userUniqueId,
    });

    if (isValidUser) {
      const listing = await saveListingModal.findOne({ listingId: listingId });
      const mobileNumber = listing.mobileNumber.trim();

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

    // if (isValidUser) {
    const listing = await saveListingModal.findOne(
      { listingId: listingId },
      { mobileNumber: 0 }
    );

    const dataObject = listing;
    res.status(200).json({
      reason: "Mobile number retrieved successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
    // } else {
    //   res.status(200).json({
    //     reason: "Invalid user id provided",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //   });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/listing/updatefordiag", async (req, res) => {
  const userUniqueId = req.body.userUniqueId;
  const listingId = req.body.listingId;

  let currentDate = Date.now
  const reqBody = {...req.body, verified: true, listingDate: currentDate, verifiedDate: currentDate};

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
          reqBody,
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

module.exports = router;
