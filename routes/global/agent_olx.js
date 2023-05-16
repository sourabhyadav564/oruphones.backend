const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const olxAgentModal = require("../../src/database/modals/global/oru_mitra/agent_olx_modal");
const olxScrappedModal = require("../../src/database/modals/global/oru_mitra/scrapped_olx_listings");
const olxSSModal = require("../../src/database/modals/global/oru_mitra/screenshot_modal");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
const generateOTP = require("../../utils/generate_otp");
const sendLoginOtp = require("../../utils/send_login_otp");
const sendingSms = require("../../utils/sms_assign");
const moment = require("moment");
const getDefaultImage = require("../../utils/get_default_image");
const AreaModal = require("../../src/database/modals/global/locations/area");
const stateAreaModal = require("../../src/database/modals/global/locations/state");
const cityAreaModal = require("../../src/database/modals/global/locations/city");

// const codeStr = () => {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// };

let devNum = ["9660398594", "6375197371", "9772557936", "9649493568"];
let otpNum = ["9261", "4126"];

router.get("/listing/agent/create", async (req, res) => {
  try {
    let mobileNumber = req.query.mobileNumber;
    let name = req.query.name;
    let email = req.query.email;
    let city = req.query.city;

    // console.log(mobileNumber, name, email, city);
    // generate random code of 6 char alpha-numeric for agent

    let agent = new olxAgentModal({
      mobileNumber: mobileNumber,
      name: name,
      email: email,
      city: city,
      type: "OlxAgent",
    });

    let result = await olxAgentModal.findOne({
      mobileNumber: mobileNumber,
    });

    if (result) {
      result = result._doc;
      if (result.mobileNumber.toString() == mobileNumber.toString()) {
        // agent already exists
        res.status(200).json({
          reason: "Agent already exists",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      } else {
        await agent.save().catch((err) => {
          res.status(200).json({
            reason: "Internal server error",
            statusCode: 500,
            status: "FAILURE",
            dataObject: {
              error: err,
            },
          });
        });
        res.status(200).json({
          reason: "Agent created successfully",
          statusCode: 201,
          status: "SUCCESS",
          dataObject: {
            //   agent: result,
          },
        });
      }
    } else {
      await agent.save();
      res.status(200).json({
        reason: "Agent created successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/login", async (req, res) => {
  try {
    const mobileNumber = req.query.mobileNumber;
    const countryCode = req.query.countryCode;

    let foundUser = await olxAgentModal.findOne({ mobileNumber });

    if (foundUser && foundUser.status == "Active") {
      const clientOTP = generateOTP();

      if (!devNum.includes(mobileNumber.toString())) {
        const userDatas = {
          countryCode: countryCode,
          mobileNumber: mobileNumber,
          otp: clientOTP,
        };
        const data = new userModal(userDatas);
        const saveData = await data.save();
        const sendMessage = await sendLoginOtp(mobileNumber, clientOTP);
      }
      res.status(200).json({
        reason: "OTP generated successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          maxTime: 120,
          submitCountIncrement: 0,
          maxRetryCount: "3",
          mobileNumber: `${countryCode}${mobileNumber}`,
        },
      });
    } else if (foundUser) {
      res.status(200).json({
        reason: "You're not allowed to login",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    } else {
      res.status(200).json({
        reason: "User not found",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/otp/validate", async (req, res) => {
  try {
    const mobileNumber = req.query.mobileNumber;
    //   const countryCode = req.query.countryCode;
    const otp = req.query.otp;

    let getOtp = {};
    if (!(otpNum.includes(otp) && devNum.includes(mobileNumber))) {
      getOtp = await userModal.findOne({
        mobileNumber: mobileNumber,
        otp: otp,
      });
    }

    if (
      (otpNum.includes(otp) && devNum.includes(mobileNumber)) ||
      (getOtp && getOtp?.otp?.toString() === otp.toString())
    ) {
      const getUser = await olxAgentModal.findOne(
        { mobileNumber },
        {
          type: 1,
          userUniqueId: 1,
          name: 1,
          mobileNumber: 1,
        }
      );

      res.status(200).json({
        reason: "OTP validated",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          getUser: getUser._doc,
        },
      });

      // find all for the mobile number and delete all
      const delete_user_otp = await userModal.deleteMany({
        mobileNumber: req.query.mobileNumber,
      });
    } else {
      res.status(200).json({
        reason: "You have entered an invalid OTP",
        statusCode: 200,
        status: "FAILED",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          mobileNumber: mobileNumber,
        },
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/details", async (req, res) => {
  try {
    let uuid = req.query.uuid;

    let agent = await olxAgentModal.findOne(
      { userUniqueId: uuid },
      {
        name: 1,
        mobileNumber: 1,
        email: 1,
        city: 1,
      }
    );

    if (agent) {
      // find total, this month and today's listings
      let listings = await saveListingModal.aggregate([
        {
          $match: {
            // agent: uuid,
            // check for both agent and agentId in case of old data
            $or: [
              {
                agent: uuid,
              },
              {
                agent: agent.name,
              },
            ],
            agentId: "001",
          },
        },
        {
          $group: {
            _id: "$agent",
            total: {
              $sum: 1,
            },
            today: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gte: [
                          "$createdAt",
                          new Date(new Date().setHours(00, 00, 00)),
                        ],
                      },
                      {
                        $lte: [
                          "$createdAt",
                          new Date(new Date().setHours(23, 59, 59)),
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            thisMonth: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gte: ["$createdAt", new Date(new Date().setDate(1))],
                      },
                      {
                        $lte: ["$createdAt", new Date(new Date().setDate(31))],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            today: 1,
            thisMonth: 1,
          },
        },
      ]);

      res.status(200).json({
        reason: "Details fetched successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          agent: agent,
          listings: listings,
        },
      });
    } else {
      res.status(200).json({
        reason: "Agent not found",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/getAgentsList", async (req, res) => {
  try {
    // get all agents data with their total, today and this month listings

    let listings = await saveListingModal.aggregate([
      {
        $match: {
          agent: {
            $ne: null,
          },
          storeId: "001",
        },
      },
      {
        $group: {
          _id: "$agent",
          total: {
            $sum: 1,
          },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        "$createdAt",
                        new Date(new Date().setHours(00, 00, 00)),
                      ],
                    },
                    {
                      $lte: [
                        "$createdAt",
                        new Date(new Date().setHours(23, 59, 59)),
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$createdAt", new Date(new Date().setDate(1))],
                    },
                    {
                      $lte: ["$createdAt", new Date(new Date().setDate(31))],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          agent: "$_id",
          total: 1,
          today: 1,
          thisMonth: 1,
        },
      },
    ]);

    console.log(listings);

    let agents = await olxAgentModal.find(
      {},
      {
        name: 1,
        mobileNumber: 1,
        email: 1,
        city: 1,
        userUniqueId: 1,
      }
    );

    // put listings into agents
    let fineData = [];

    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      let listing = listings.find(
        (item) => item.agent == agent.name || item.agent == agent.userUniqueId
      );
      if (listing) {
        agent.total = listing.total;
        agent.today = listing.today;
        agent.thisMonth = listing.thisMonth;
      } else {
        agent.total = 0;
        agent.today = 0;
        agent.thisMonth = 0;
      }
      fineData.push(agent);
    }

    res.status(200).json({
      reason: "Details fetched successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        agents: fineData,
      },
    });
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/getBothList", async (req, res) => {
  // Both, Live and Contacted Listings
  try {
    let uuid = req.query.uuid;

    let user = await olxAgentModal.find({
      userUniqueId: uuid,
    });

    if (user) {
      let totalListings = await olxScrappedModal.find(
        {
          assignedTo: uuid,
        },
        {
          _id: 1,
          price: 1,
          make: 1,
          chatLink: 1,
          status: 1,
          link: 1,
        }
      );

      if (totalListings.length == 0) {
        // assign latest 100 listings to the agent which are not assigned to anyone
        let newListings = await olxScrappedModal
          .find(
            {
              assignedTo: null,
            },
            {
              _id: 1,
              price: 1,
              make: 1,
              chatLink: 1,
              status: 1,
              link: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(100);

        if (newListings.length > 0) {
          for (let i = 0; i < newListings.length; i++) {
            let updateListing = await olxScrappedModal.findOneAndUpdate(
              { _id: newListings[i]._id },
              { $set: { assignedTo: uuid, status: "Live" } }
            );
          }
        }

        res.status(200).json({
          reason: "Listings fetched successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            liveListings: newListings,
            contactedListings: [],
          },
        });
      } else {
        let liveListings = await totalListings.filter(
          (item) => item.status == "Live"
        );
        let contactedListings = await totalListings.filter(
          (item) => item.status == "Contacted"
        );

        res.status(200).json({
          reason: "Listings fetched successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            liveListings: liveListings,
            contactedListings: contactedListings,
          },
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/addToContacted", async (req, res) => {
  try {
    let listingId = req.query.listingId;
    let uuid = req.query.uuid;

    let updateListing = await olxScrappedModal.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(listingId),
        assignedTo: uuid,
      },
      { $set: { status: "Contacted" } }
    );

    if (updateListing) {
      res.status(200).json({
        reason: "Listing updated successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    } else {
      res.status(200).json({
        reason: "Sorry, Listing not found",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/listing/agent/validateNumber", async (req, res) => {
  try {
    let mobileNumber = req.query.mobileNumber.toString();
    let listingId = req.query.listingId;
    let uuid = req.query.uuid;
    let countryCode = req.query.countryCode;

    // get unique numbers in mobile number

    let uniqueNumbers = [...new Set(mobileNumber)];

    if (uniqueNumbers.length > 3 && mobileNumber.length == 10) {
      let foundUser = await createUserModal.findOne({
        mobileNumber: mobileNumber,
        //   userType: "olxUser",
      });

      if (foundUser) {
        foundUser = foundUser._doc;
        if (foundUser.isaccountexpired == true) {
          res.status(200).json({
            reason: "Account is expired",
            statusCode: 200,
            status: "FAILURE",
            dataObject: {
              allowNum: false,
              listing: {},
            },
          });
        } else if (foundUser.userType == "olxUser") {
          // find the updatedAt time is less than 15 days
          let now = new Date();
          let updatedAt = new Date(foundUser.updatedAt);
          let diff = now - updatedAt;
          let diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

          if (diffDays > 15) {
            // find the listing
            let listing = await olxScrappedModal.findOne({
              _id: mongoose.Types.ObjectId(listingId),
              assignedTo: uuid,
            });

            if (listing) {
              res.status(200).json({
                reason: "Inactive user found",
                statusCode: 200,
                status: "SUCCESS",
                dataObject: {
                  listing: listing._doc,
                  user: foundUser,
                  allowNum: true,
                },
              });
            } else {
              res.status(200).json({
                reason: "Sorry, Listing not found",
                statusCode: 200,
                status: "FAILURE",
                dataObject: {
                  listing: {},
                  allowNum: false,
                },
              });
            }
          } else {
            res.status(200).json({
              reason: "Active Olx user found",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                listing: {},
                allowNum: false,
              },
            });
          }
        } else {
          res.status(200).json({
            reason: "ORU user found",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {
              listing: {},
              allowNum: false,
            },
          });
        }
      } else {
        // find the listing
        let listing = await olxScrappedModal.findOne({
          _id: mongoose.Types.ObjectId(listingId),
          assignedTo: uuid,
        });

        if (listing) {
          let uName = listing.userName || "ORU User";
          uName = uName.toLowerCase().replace(/olx/g, "ORU");

          let createdDate = moment(new Date()).format("L");

          // create new user
          let newUser = createUserModal({
            mobileNumber: mobileNumber,
            countryCode: countryCode,
            userType: "olxUser",
            userName: uName,
            city: listing.location,
            createdDate: createdDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          let userData = await newUser.save();

          res.status(200).json({
            reason: "New Number",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {
              listing: listing._doc,
              user: userData._doc,
              allowNum: true,
            },
          });
        } else {
          res.status(200).json({
            reason: "Sorry, Listing not found",
            statusCode: 200,
            status: "FAILURE",
            dataObject: {
              listing: {},
              allowNum: false,
            },
          });
        }
      }
    } else {
      //Tryin to add invalid number
      res.status(200).json({
        reason: "Invalid Number",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {
          listing: {},
          allowNum: false,
        },
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
        allowNum: false,
      },
    });
  }
});

router.get("/listing/agent/release", async (req, res) => {
  try {
    let listingId = req.query.listingId;
    let uuid = req.query.uuid;

    let updateListing = await olxScrappedModal.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(listingId),
        assignedTo: uuid,
      },
      { $set: { assignedTo: null, status: "Live" } }
    );

    if (updateListing) {
      res.status(200).json({
        reason: "Listing released successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    } else {
      res.status(200).json({
        reason: "Sorry, Listing not found",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.post("/listing/agent/submit", async (req, res) => {
  try {
    const userUniqueId = req.body.userUniqueId;
    let listedBy = req.body.listedBy;
    let associatedWith = "";
    let mobileNumber = "";

    const userDetails = await createUserModal.findOne(
      {
        userUniqueId: userUniqueId,
      },
      { userName: 1, mobileNumber: 1, _id: 1, associatedWith: 1 }
    );

    if (userDetails) {
      if (
        (userDetails?.userName == null ||
          userDetails?.userName?.length === 0) &&
        listedBy?.length > 0 &&
        !listedBy.toString().toLowerCase().includes("olx")
      ) {
        const userName = listedBy;
        let data = await createUserModal.findByIdAndUpdate(userDetails._id, {
          $set: { userName: userName },
        });
      } else {
        listedBy = userDetails?.userName;
      }

      mobileNumber = userDetails?.mobileNumber;

      if (userDetails?.associatedWith) {
        associatedWith = userDetails?.associatedWith;
      }

      const charger = req.body.charger;
      const color = req.body.color;
      let deviceCondition = req.body.deviceCondition;
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
      const model = req.body.model;
      const originalbox = req.body.originalbox;
      const platform = req.body.platform;
      const recommendedPriceRange = req.body.recommendedPriceRange;
      const deviceImagesAvailable = images.length > 0 ? true : false;
      const deviceRam = req.body.deviceRam;
      let deviceWarranty = req.body.warranty;
      const cosmetic = req.body.cosmetic;

      const agentId = req.body.agentId;
      const locality = req.body.locality; //Lajpat Nagar, Lucknow, Uttar Pradesh

      let area = locality.split(",")[0].trim();
      let city = locality.split(",")[1].trim();
      let state = locality.split(",")[2].trim();

      let stateId = await stateAreaModal.findOne(
        {
          name: state,
        },
        {
          id: 1,
        }
      );

      let cityId = await cityAreaModal.findOne(
        {
          name: city,
          parentId: stateId.id,
        },
        {
          id: 1,
        }
      );

      let latLong = await AreaModal.findOne(
        {
          name: area,
          parentId: cityId.id,
        },
        {
          latitude: 1,
          longitude: 1,
        }
      );

      if (deviceCondition == "Like New") {
        switch (deviceWarranty) {
          case "four":
            deviceCondition = "Excellent";
            break;
          case "seven":
            deviceCondition = "Excellent";
            break;
          case "more":
            deviceCondition = "Good";
            break;
          default:
            deviceCondition = deviceCondition;
            break;
        }
      } else if (deviceCondition == "Excellent") {
        switch (deviceWarranty) {
          case "seven":
            deviceCondition = "Excellent";
            break;
          case "more":
            deviceCondition = "Good";
            break;
          default:
            deviceCondition = deviceCondition;
            break;
        }
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
          break;
      }

      const now = new Date();
      const dateFormat = moment(now).format("MMM Do");
      const image = await getDefaultImage(marketingName);

      const defaultImage = {
        fullImage: image,
      };

      let limitExceeded =
        (await saveListingModal.find().countDocuments({
          userUniqueId,
          verified: false,
          status: "Active",
        })) >= 5;

      // stop user to save duplicate activated listing on basis of mobileNumber, marketingName, storage & ram
      let duplicated = limitExceeded
        ? limitExceeded
        : (await saveListingModal.find().countDocuments({
            userUniqueId,
            marketingName,
            deviceStorage,
            deviceRam,
            verified: false,
          })) >= 1;

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
        status: limitExceeded || duplicated ? "Paused" : "Active",
        agent: agentId,
        latLong: latLong,
        storeId: "001",
      };

      let dataObject = {};

      try {
        if (!limitExceeded && !duplicated) {
          const modalInfo = new saveListingModal(data);
          dataObject = await modalInfo.save();

          let ssdata = {
            userUniqueId: req.body.agentUuId,
            image: req.body.ssImage,
            model: marketingName,
            mobileNumber: mobileNumber,
          };

          const ssModalInfo = new olxSSModal(ssdata);
          const ssDataObject = await ssModalInfo.save();

          let newData = {
            ...data,
            notionalPercentage: -999999,
            status: limitExceeded || duplicated ? "Sold_Out" : "Active",
            imagePath:
              (images.length > 0
                ? images[0].thumbImage || images[0].fullImage
                : "") ||
              (defaultImage.fullImage != "" ? defaultImage.fullImage : ""),
            listingId: dataObject.listingId,
            listingDate: moment(now).format("MMM Do"),
          };

          const tempModelInfo = new bestDealsModal(newData);
          if (tempModelInfo.make != null) {
            const tempDataObject = await tempModelInfo.save();
          }

          await sendingSms(
            "daily",
            mobileNumber,
            userUniqueId,
            listedBy,
            marketingName
          );

          // delete the listing
          let listingId = req.body.objId;

          let deleted = await olxScrappedModal.deleteOne({
            _id: mongoose.Types.ObjectId(listingId),
          });
        }

        // create dynamic string for response message reason on basis of limitExceeded and duplicated value

        let message = limitExceeded
          ? // ? "Added Successfully but Paused because 5 listing Limit exceeded!"
            "You have already exceeded your quota of unverified listings at ORU !\nYou can go to my listing page and delete your old unvarified listings or you can convert them into verified listings\n\nOR\n\nYou can download the app and verify this device."
          : duplicated
          ? // ? "Added Successfully but Paused because This exact listing already present!"
            "You have already listed same device at ORU for sell !\nYou can go to my listing page and select edit option, if you want to modify your existing listing.\n\nOR\n\nYou can download the app and verify this device."
          : "Listing saved successfully";

        res.status(201).json({
          // reason: "Listing saved successfully",
          reason: message,
          statusCode: 201,
          status: "SUCCESS",
          type: limitExceeded
            ? "Unverified Listings Limit Exceeded"
            : duplicated
            ? "Duplicate Listing"
            : "",
          dataObject: dataObject,
        });
        return;
      } catch (error) {
        res.status(200).json({
          reason: "Internal server error",
          statusCode: 500,
          status: "FAILURE",
          dataObject: {
            error: error,
          },
        });
      }
    } else {
      res.status(200).json({
        reason: "Invalid user unique id provided",
        statusCode: 200,
        status: "FAILURE",
      });
      return;
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

module.exports = router;
