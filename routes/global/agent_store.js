const express = require("express");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const deviceIdModal = require("../../src/database/modals/global/device_id_list_modal");
const router = express.Router();
const createAgentModal = require("../../src/database/modals/global/oru_mitra/agent_modal");
const attachedListingsModal = require("../../src/database/modals/global/oru_mitra/attached_mitras_modal");
const scrappedMitrasModal = require("../../src/database/modals/global/oru_mitra/scrapped_mitras");
const adminCredModal = require("../../src/database/modals/login/admin_cred_modal");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const bestDealsModal = require("../../src/database/modals/others/best_deals_models");
const generateOTP = require("../../utils/generate_otp");
const { oruMitraCons } = require("../../utils/matrix_figures");
const sendLoginOtp = require("../../utils/send_login_otp");

const codeStr = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

let devNum = ["9660398594", "6375197371", "9772557936", "9649493568"];
let otpNum = ["9261", "4126"];

router.get("/agent/create", async (req, res) => {
  try {
    let mobileNumber = req.query.mobileNumber;
    let name = req.query.name;
    let email = req.query.email;
    let address = req.query.address;
    let city = req.query.city;
    let referralCode = codeStr();

    // generate random code of 6 char alpha-numeric for agent

    let agent = new createAgentModal({
      mobileNumber: mobileNumber,
      name: name,
      email: email,
      address: address,
      city: city,
      referralCode: referralCode,
      type: "Agent",
    });

    let result = await createAgentModal.findOne({
      // check if agent already exists or the code is already used
      $or: [{ mobileNumber: mobileNumber }, { referralCode: referralCode }],
    });

    if (result) {
      result = result._doc;
      if (result.mobileNumber.toString() == mobileNumber.toString()) {
        // agent already exists
        res.status(200).json({
          reason: "Agent already exists",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            //   agent: result,
          },
        });
      } else {
        // code already exists
        referralCode = codeStr();
        agent.referralCode = referralCode;
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
          statusCode: 200,
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
        statusCode: 200,
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

router.post("/agent/oruMitra/create", async (req, res) => {
  try {
    let kioskId = req.body.kioskId;
    let name = req.body.name;
    let email = req.body.email;
    let address = req.body.address;
    let city = req.body.city;
    let referralCode = codeStr();
    let images = req.body.images;
    let mobileNumber = req.body.mobileNumber;
    let upiId = req.body.upiId;
    let agentId = req.body.agentId;

    let oruMitra = new createAgentModal({
      kioskId: kioskId,
      name: name,
      email: email,
      address: address,
      city: city,
      referralCode: referralCode,
      type: kioskId == "" ? "Broker" : "OruMitra",
      images: images,
      mobileNumber: mobileNumber,
      upiId: upiId,
      agentId: agentId,
    });

    let result = await createAgentModal.findOne({
      // check if agent already exists or the code is already used
      $or: [
        { mobileNumber: mobileNumber },
        { referralCode: referralCode },
        { kioskId: kioskId == "" ? "others" : kioskId },
        // { upiId: upiId },
      ],
    });

    let successMsg =
      "Congratulations!\n\n\nYou have successfully created ORU-Mitra";

    if (result) {
      result = result._doc;
      if (
        result.mobileNumber.toString() == mobileNumber.toString() ||
        result.kioskId.toString() == kioskId.toString()
      ) {
        // agent already exists
        res.status(200).json({
          reason: "ORU-Mitra already exists",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
        // } else if (result.upiId.toString() == upiId.toString()) {
        //   // upiId already exists
        //   res.status(200).json({
        //     reason: "UPI ID already exists",
        //     statusCode: 200,
        //     status: "SUCCESS",
        //     dataObject: {},
        //   });
      } else {
        // code already exists
        referralCode = codeStr();
        oruMitra.referralCode = referralCode;
        let dataObj = await oruMitra.save().catch((err) => {
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
          reason: "ORU-Mitra created successfully",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            ...dataObj._doc,
            successMsg: successMsg,
          },
        });
      }
    } else {
      let dataObj = await oruMitra.save();
      res.status(200).json({
        reason: "ORU-Mitra created successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          ...dataObj._doc,
          successMsg: successMsg,
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

router.get("/agent/login", async (req, res) => {
  try {
    const mobileNumber = req.query.mobileNumber;
    const countryCode = req.query.countryCode;

    let foundUser = await createAgentModal.findOne({ mobileNumber });

    if (foundUser && foundUser.status == "Active") {
      const clientOTP = generateOTP();

      const userDatas = {
        countryCode: countryCode,
        mobileNumber: mobileNumber,
        otp: clientOTP,
      };

      const data = new userModal(userDatas);
      const saveData = await data.save();
      if (!devNum.includes(mobileNumber.toString())) {
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

router.get("/agent/otp/validate", async (req, res) => {
  try {
    const mobileNumber = req.query.mobileNumber;
    const countryCode = req.query.countryCode;
    const otp = req.query.otp;

    const getOtp = await userModal.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
    });

    if (
      (getOtp && getOtp?.otp?.toString() === otp.toString()) ||
      (otpNum.includes(otp) && devNum.includes(mobileNumber))
    ) {
      const getUser = await createAgentModal.findOne(
        { mobileNumber },
        {
          type: 1,
          userUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          referralCode: 1,
          kioskId: 1,
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
      const delete_user = await userModal.deleteMany({
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

router.get("/agent/info", async (req, res) => {
  try {
    let agentUuId = req.query.userUniqueId;
    let agentId = req.query.agentId;

    let agent = await createAgentModal.findOne(
      {
        userUniqueId: agentUuId,
        referralCode: agentId,
      },
      { _id: 0, __v: 0 }
    );

    if (agent) {
      agent = agent._doc;
      if (agent.type == "Agent") {
        // get all oru mitras associated with this agent
        let oruMitra = await createAgentModal.find(
          {
            agentId: agentId,
            type: ["OruMitra", "Broker"],
          },
          {
            kioskId: 1,
            name: 1,
            mobileNumber: 1,
            type: 1,
            address: 1,
            city: 1,
            status: 1,
            referralCode: 1,
          }
        );

        if (oruMitra) {
          agent.oruMitra = oruMitra.map((item) => item._doc);

          let allOruMitraRefCodes = agent.oruMitra.map(
            (item) => item.referralCode
          );

          // let countVerifiedAndTotalListForEachMitra = await saveListingModal.countDocuments({

          let countVerifiedAndTotalListForEachMitra =
            await saveListingModal.aggregate([
              {
                $match: {
                  associatedWith: { $in: allOruMitraRefCodes },
                },
              },
              {
                $group: {
                  _id: "$associatedWith",
                  total: { $sum: 1 },
                  verified: {
                    $sum: {
                      $cond: [{ $eq: ["$verified", true] }, 1, 0],
                    },
                  },
                },
              },
            ]);

          if (countVerifiedAndTotalListForEachMitra) {
            agent.oruMitra = agent.oruMitra.map((item) => {
              let count = countVerifiedAndTotalListForEachMitra.find(
                (countItem) => countItem._id === item.referralCode
              );

              if (count) {
                item.totalListings = count.total;
                item.verifiedListings = count.verified;
              } else {
                item.totalListings = 0;
                item.verifiedListings = 0;
              }

              return item;
            });
          }
        }
      }

      res.status(200).json({
        reason: "Agent info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          agent: agent,
        },
      });
    } else {
      res.status(200).json({
        reason: "Agent not found",
        statusCode: 200,
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

router.get("/agent/oruMitra/info", async (req, res) => {
  try {
    let kioskId = req.query.kioskId;
    let brokerId = req.query.brokerId;
    let mobileNumber = req.query.mobileNumber;

    let findQuery = {
      mobileNumber: "12345",
    };

    if (kioskId) {
      findQuery = {
        kioskId: kioskId,
        type: "OruMitra",
      };
    } else if (brokerId) {
      findQuery = {
        mobileNumber: mobileNumber,
        referralCode: brokerId,
        type: "Broker",
      };
    }

    // get oru mitra info
    let oruMitra = await createAgentModal.findOne(findQuery);

    if (oruMitra) {
      // get relationship manager info
      let relationshipManager = await createAgentModal.findOne(
        {
          referralCode: oruMitra.agentId,
          type: "Agent",
        },
        {
          name: 1,
          mobileNumber: 1,
        }
      );

      res.status(200).json({
        reason: "ORU-Mitra info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          oruMitra: {
            ...oruMitra._doc,
            relationshipManager: relationshipManager._doc,
            statusCode: "Already registered",
          },
        },
      });
    } else {
      let oruMitra2 = await scrappedMitrasModal.findOne({
        kioskId: kioskId,
      });
      if (oruMitra2) {
        oruMitra2 = oruMitra2._doc;
        let isBlacklisted = oruMitra2.status == "Blacklisted" ? true : false;

        if (isBlacklisted) {
          res.status(200).json({
            reason: "ORU-Mitra is blacklisted",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {
              oruMitra: oruMitra2,
              statusCode: "Blacklisted",
            },
          });
        } else {
          // send the oru mitra info to the agent
          res.status(200).json({
            reason: "OruMitra info",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {
              oruMitra: oruMitra2,
              statusCode: "Not registered",
            },
          });
        }
      } else {
        res.status(200).json({
          reason: "ORU-Mitra not found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {
            oruMitra: {},
            statusCode: "Not found",
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

router.get("/agent/oruMitra/data", async (req, res) => {
  try {
    let kioskId = req.query.kioskId;
    let agentUuId = req.query.userUniqueId;

    // get oru mitra info
    let oruMitra = await createAgentModal.findOne(
      {
        kioskId: kioskId,
        userUniqueId: agentUuId,
      },
      { referralCode: 1 }
    );

    if (oruMitra) {
      // get users with the code
      let users = await createUserModal.find(
        {
          associatedWith: oruMitra.referralCode,
        },
        { userUniqueId: 1, userName: 1, mobileNumber: 1, createdAt: 1 }
      );

      // let allUuIds = users.map((user) => user.userUniqueId);

      let allListingsAttachedOrPreviouslyAttached =
        await attachedListingsModal.aggregate([
          {
            $match: {
              $or: [
                {
                  attachedTo: oruMitra.referralCode,
                },
                {
                  "previousData.attachedTo": oruMitra.referralCode,
                },
              ],
            },
          },
          {
            $project: {
              listingId: 1,
              attachedTo: 1,
              attachedOn: 1,
              previousData: 1,
            },
          },
        ]);

      let oldListingIds = allListingsAttachedOrPreviouslyAttached.map(
        (item) => item.listingId
      );

      let oldListings = await saveListingModal.find(
        {
          listingId: { $in: oldListingIds },
        },
        {
          listingDate: 1,
          make: 1,
          model: 1,
          deviceStorage: 1,
          deviceRam: 1,
          listingPrice: 1,
          mobileNumber: 1,
          listedBy: 1,
          listingLocation: 1,
          verified: 1,
          verifiedDate: 1,
          status: 1,
          deviceCondition: 1,
          listedBy: 1,
          listingId: 1,
        }
      );

      let listings = await saveListingModal.find(
        {
          // userUniqueId: { $in: allUuIds },
          associatedWith: oruMitra.referralCode,
        },
        {
          listingDate: 1,
          make: 1,
          model: 1,
          deviceStorage: 1,
          deviceRam: 1,
          listingPrice: 1,
          mobileNumber: 1,
          listedBy: 1,
          listingLocation: 1,
          verified: 1,
          verifiedDate: 1,
          status: 1,
          deviceCondition: 1,
          listedBy: 1,
          listingId: 1,
        }
      );

      listings = [...listings, ...oldListings];

      // remove duplicates
      listings = listings.map((listing) => JSON.stringify(listing));
      listings = [...new Set(listings)];
      listings = listings.map((listing) => JSON.parse(listing));

      let totalVerified = 0;
      let totalListings = 0;

      for (let listing of listings) {
        listing.status = listing.status == "Active" ? "Linked" : listing.status;

        let listingId = listing.listingId.toString();

        for (let item of allListingsAttachedOrPreviouslyAttached) {
          if (
            item.listingId.toString() == listingId.toString() &&
            item.previousData.length > 0
          ) {
            if (
              item.attachedTo.toString() == oruMitra.referralCode.toString()
            ) {
              listing.status = "Transferred";
            } else {
              listing.status = "Delinked";
            }
          }
        }

        // mask the mobile number if the listing is Delinked or Sold_Out
        if (listing.status == "Delinked" || listing.status == "Sold_Out") {
          listing.mobileNumber = "**********";
          listing.listedBy = "********";
        }

        if (listing.verified) {
          totalVerified++;
        }
        totalListings++;
      }

      // let totalEarnings = totalVerified * 5;

      // find the number of listings that are verified and status is Linked from listings
      // let totalUniqueListings = listings.filter(
      //   (listing) =>
      //     listing.verified &&
      //     listing.status != "Delinked" &&
      //     listing.status != "Transferred"
      // ).length;

      let payableListings = await deviceIdModal.find(
        {
          attachedTo: oruMitra.referralCode,
          isExpired: false,
          // get the listings which are verified within the last 100 days
          verifiedOn: {
            $gte: new Date(new Date().getTime() - 100 * 24 * 60 * 60 * 1000),
          },
          payStatus: "Y",
        },
        { listingId: 1 }
      );

      let totalEarnings = payableListings * oruMitraCons.earningPerListing;

      // remove the user unique id from the users array
      users = users.map((user) => {
        return {
          userName: user.userName,
          mobileNumber: user.mobileNumber,
          createdAt: user.createdAt,
        };
      });

      let dataObject = {
        totalListings: totalListings,
        totalVerified: totalVerified,
        totalEarnings: totalEarnings,
        listings: listings,
        users: users,
      };

      res.status(200).json({
        reason: "ORU-Mitra info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: dataObject,
      });
    } else {
      res.status(200).json({
        reason: "ORU-Mitra not found",
        statusCode: 200,
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

router.get("/agent/oruMitra/attach", async (req, res) => {
  try {
    let userUniqueId = req.query.userUniqueId;
    let referralCode = req.query.referralCode;

    // check referral code
    let oruMitra = await createAgentModal.findOne({
      referralCode: referralCode,
      type: ["OruMitra", "Broker"],
    });

    if (oruMitra) {
      let userData = await createUserModal.findOneAndUpdate(
        {
          userUniqueId: userUniqueId,
        },
        {
          $set: {
            associatedWith: referralCode,
          },
        }
      );

      if (userData) {
        let listings = await saveListingModal.find({
          userUniqueId: userUniqueId,
        });

        // listings.forEach(async (listing) => {
        for (let listing of listings) {
          await updateMitraData(listing.listingId, referralCode, false);
          await saveListingModal.findOneAndUpdate(
            {
              _id: listing._id,
            },
            {
              $set: {
                associatedWith: referralCode,
              },
            }
          );
        }

        let bestListings = await bestDealsModal.find({
          userUniqueId: userUniqueId,
        });

        // bestListings.forEach(async (listing) => {
        for (let listing of bestListings) {
          await bestDealsModal.findOneAndUpdate(
            {
              listingId: listing.listingId,
            },
            {
              $set: {
                associatedWith: referralCode,
              },
            }
          );
        }

        res.status(200).json({
          // reason: `ORU-Mitra attached successfully to ${userData.name}`,
          reason: `You've successfully linked your account with ORU-Mitra: ${oruMitra.name}`,
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      } else {
        res.status(200).json({
          reason: "ORU-Mitra not found",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      }
    } else {
      res.status(200).json({
        reason: "ORU-Mitra not found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error\nPlease try again later",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/agent/oruMitra/detach", async (req, res) => {
  try {
    let userUniqueId = req.query.userUniqueId;

    let userData = await createUserModal.findOne({
      userUniqueId: userUniqueId,
    });

    let referralCode = userData.associatedWith;

    if (userData && userData.associatedWith && userData.associatedWith != "") {
      // update the user
      let updatedUser = await createUserModal.findOneAndUpdate(
        {
          _id: userData._id,
        },
        {
          $set: {
            associatedWith: "",
          },
        }
      );

      let listings = await saveListingModal.find({
        userUniqueId: userUniqueId,
      });

      // listings.forEach(async (listing) => {
      for (let listing of listings) {
        await updateMitraData(listing.listingId, "", true);

        await saveListingModal.findOneAndUpdate(
          {
            _id: listing._id,
          },
          {
            $set: {
              associatedWith: "",
            },
          }
        );
      }

      let bestListings = await bestDealsModal.find({
        userUniqueId: userUniqueId,
      });

      // bestListings.forEach(async (listing) => {
      for (let listing of bestListings) {
        await bestDealsModal.findOneAndUpdate(
          {
            listingId: listing.listingId,
          },
          {
            $set: {
              associatedWith: "",
            },
          }
        );
      }

      res.status(200).json({
        reason: "ORU-Mitra detached successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    } else {
      res.status(200).json({
        reason: "User not found or not associated with any ORU-Mitra",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(200).json({
      reason: "Internal server error\nPlease try again later",
      statusCode: 500,
      status: "FAILURE",
      dataObject: {
        error: error,
      },
    });
  }
});

router.get("/agent/oruMitra/delink", async (req, res) => {
  try {
    let mitraUserUniqueId = req.query.userUniqueId;
    let listingId = req.query.listingId;
    let status = req.query.status;
    let attachedUsedMob = req.query.attachedUsedMob;

    let user = await createAgentModal.findOne({
      userUniqueId: mitraUserUniqueId,
      type: ["OruMitra", "Broker"],
    });

    if (user) {
      if (listingId) {
        console.log("listingId", listingId);
        let listing = await saveListingModal.findOne({
          _id: listingId,
        });

        if (listing) {
          if (status == "Sold_Out") {
            let updatedListing = await saveListingModal.findOneAndUpdate(
              {
                _id: listingId,
              },
              {
                $set: {
                  status: "Sold_Out",
                },
              }
            );

            let updatedBestDeals = await bestDealsModal.findOneAndUpdate(
              {
                listingId: listingId,
              },
              {
                $set: {
                  status: "Sold_Out",
                },
              }
            );
          } else {
            await updateMitraData(listing.listingId, "", true);

            let updatedListing = await saveListingModal.findOneAndUpdate(
              {
                _id: listingId,
              },
              {
                $set: {
                  associatedWith: "",
                },
              }
            );
          }

          res.status(200).json({
            reason: "ORU-Mitra detached from listing",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {},
          });
        } else {
          res.status(200).json({
            reason: "Listing not found",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {},
          });
        }
      } else if (attachedUsedMob) {
        let user = await createUserModal.findOne(
          {
            mobileNumber: attachedUsedMob.toString().trim(),
          },
          {
            associatedWith: 1,
            _id: 1,
            userUniqueId: 1,
          }
        );

        if (user) {
          // delete user.associatedWith;
          let user2 = await createUserModal.findOneAndUpdate(
            {
              _id: user._id,
            },
            {
              $set: {
                associatedWith: "",
              },
            }
          );

          let listings = await saveListingModal.find({
            userUniqueId: user.userUniqueId,
          });

          // listings.forEach(async (listing) => {
          for (let listing of listings) {
            listing = listing._doc;
            await updateMitraData(listing.listingId, "", true);
            await saveListingModal.findOneAndUpdate(
              {
                _id: listing._id,
              },
              {
                $set: {
                  associatedWith: "",
                },
              }
            );
          }

          let bestListings = await bestDealsModal.find({
            userUniqueId: user.userUniqueId,
          });

          // bestListings.forEach(async (listing) => {
          for (let listing of bestListings) {
            listing = listing._doc;

            await bestDealsModal.findOneAndUpdate(
              {
                listingId: listing.listingId,
              },
              {
                $set: {
                  associatedWith: "",
                },
              }
            );
          }

          res.status(200).json({
            reason: "ORU-Mitra detached from user",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {},
          });
        } else {
          res.status(200).json({
            reason: "User not found",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {},
          });
        }
      } else {
        res.status(200).json({
          reason: "Provide listingId or attachedUsedId",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      }
    } else {
      res.status(200).json({
        reason: "ORU-Mitra not found",
        statusCode: 200,
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

const updateMitraData = async (listingId, referralCode, delink) => {
  try {
    let foundListing = await attachedListingsModal.findOne({
      listingId: listingId,
    });

    if (foundListing) {
      let lastCode = foundListing.attachedTo;
      let lastDate = foundListing.attachedOn;

      foundListing.attachedTo = delink ? "" : referralCode;
      foundListing.attachedOn = new Date();

      let previousData = {
        attachedOn: lastDate,
        attachedTo: lastCode,
      };

      foundListing.previousData.push(previousData);

      await foundListing.save();
    } else if (!delink) {
      let newListing = new attachedListingsModal({
        listingId: listingId,
        attachedTo: referralCode,
        attachedOn: new Date(),
      });

      await newListing.save();
    }

    // remove objects from previous array if attachedOn is more than 60 days
    let listings = await attachedListingsModal.find();

    listings.forEach(async (listing) => {
      let previous = listing.previousData;

      let newPrevious = [];

      previous.forEach((prev) => {
        let currentDate = new Date();
        let attachedOn = new Date(prev.attachedOn);

        let diff = currentDate.getTime() - attachedOn.getTime();

        let days = diff / (1000 * 3600 * 24);

        if (days < 60) {
          newPrevious.push(prev);
        }
      });

      listing.previous = newPrevious;

      await listing.save();
    });
  } catch (error) {
    console.log("error in updateMitraData", error);
  }
};

router.get("/agent/oruMitra/list", async (req, res) => {
  try {
    let accessKey = req.query.accessKey;

    let admin = await adminCredModal.findOne({
      key: accessKey,
    });

    if (admin) {
      let type = req.query.type;
      type = type.toString().includes(",") ? type.split(",") : [type];
      let dataList = await createAgentModal.find({
        type: type,
      });

      if (type == "Agent") {
        // if type is Agent, then fetch all the OruMitra's associated with the agent using key agentId for eachagent in dataList
        let newList = [];

        for (let i = 0; i < dataList.length; i++) {
          let agent = dataList[i];
          let agentId = agent.referralCode;

          let mitras = await createAgentModal.find({
            agentId: agentId,
          });

          let mitraList = [];

          mitras.forEach((mitra) => {
            let mitraObj = {
              name: mitra.name,
              mobileNumber: mitra.mobileNumber,
              referralCode: mitra.referralCode,
              type: mitra.type,
              status: mitra.status,
              createdAt: mitra.createdAt,
            };

            mitraList.push(mitraObj);
          });

          let agentObj = {
            name: agent.name,
            mobileNumber: agent.mobileNumber,
            referralCode: agent.referralCode,
            status: agent.status,
            userUniqueId: agent.userUniqueId,
            email: agent.email,
            type: agent.type,
            address: agent.address,
            city: agent.city,
            mitras: mitraList,
            createdAt: agent.createdAt,
          };

          newList.push(agentObj);
        }

        dataList = newList;
      } else if (
        type.toString().includes("OruMitra") ||
        type.toString().includes("Broker")
      ) {
        // if type is OruMitra, then fetch all the listings associated with the OruMitra using key associatedWith for each OruMitra in dataList
        let newList = [];

        for (let i = 0; i < dataList.length; i++) {
          let mitra = dataList[i];
          let mitraId = mitra.referralCode;

          let verifiedListings = await saveListingModal
            .find({
              associatedWith: mitraId,
              verified: true,
            })
            .countDocuments();

          let unverifiedListings = await saveListingModal
            .find({
              associatedWith: mitraId,
              verified: false,
            })
            .countDocuments();

          let payableListings = await deviceIdModal
            .find({
              attachedTo: mitraId,
              isExpired: false,
              // get the listings which are verified within the last 100 days
              verifiedOn: {
                $gte: new Date(
                  new Date().getTime() - 100 * 24 * 60 * 60 * 1000
                ),
              },
              payStatus: "Y",
            })
            .countDocuments();

          let paidListings = await deviceIdModal
            .find({
              attachedTo: mitraId,
              payStatus: "Paid",
            })
            .countDocuments();

          let listingList = [];

          // // listings.forEach((listing) => {
          // for (let listing of listings) {
          //   let listingObj = {
          //     listingId: listing.listingId,
          //     marketingName: listing.marketingName,
          //     listingPrice: listing.listingPrice,
          //     listedOn: listing.listedOn,
          //     listingLocation: listing.listingLocation,
          //     status: listing.status,
          //     verified: listing.verified,
          //   };

          //   listingList.push(listingObj);
          // }

          let mitraObj = {
            name: mitra.name,
            mobileNumber: mitra.mobileNumber,
            referralCode: mitra.referralCode,
            status: mitra.status,
            type: mitra.type,
            listings: listingList,
            kioskId: mitra.kioskId,
            email: mitra.email,
            address: mitra.address,
            city: mitra.city,
            type: mitra.type,
            userUniqueId: mitra.userUniqueId,
            upiId: mitra.upiId,
            createdAt: mitra.createdAt,
            verifiedListings: verifiedListings,
            unverifiedListings: unverifiedListings,
            payableListings: payableListings,
            paidListings: paidListings,
          };

          newList.push(mitraObj);
        }

        dataList = newList;
      }

      if (dataList.length > 0) {
        res.status(200).json({
          reason: `Data list fetched successfully for the type: ${type}`,
          statusCode: 200,
          status: "SUCCESS",
          dataObject: dataList,
        });
      } else {
        res.status(200).json({
          reason: `Data list not found for the type: ${type}`,
          statusCode: 200,
          status: "SUCCESS",
          dataObject: dataList,
        });
      }
    } else {
      res.status(200).json({
        reason: "Invalid access key",
        statusCode: 401,
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

router.get("/agent/oruMitra/earnings", async (req, res) => {
  try {
    let referralCode = req.query.referralCode || "abc123";

    let payableListings = await deviceIdModal.find(
      {
        attachedTo: referralCode,
        isExpired: false,
        // get the listings which are verified within the last 100 days
        verifiedOn: {
          $gte: new Date(new Date().getTime() - 100 * 24 * 60 * 60 * 1000),
        },
        payStatus: "Y",
      },
      { listingId: 1, verifiedOn: 1 }
    );

    let payableAmount = oruMitraCons.earningPerListing * payableListings.length;

    let paidListings = await deviceIdModal.find(
      {
        attachedTo: referralCode,
        payStatus: "Paid",
      },
      { listingId: 1, verifiedOn: 1 }
    );

    let paidAmount = oruMitraCons.earningPerListing * paidListings.length;

    // console.log("payableListings", payableListings);
    // console.log("paidListings", paidListings);

    let payableListingsArray = [];

    if (payableListings.length > 0) {
      let allPayableListings = payableListings.map((item) => item.listingId);
      // payableListingsArray = await saveListingModal.find(
      //   {
      //     listingId: { $in: allPayableListings },
      //   },
      //   {
      //     listingId: 1,
      //     marketingName: 1,
      //     listingPrice: 1,
      //     createdAt: 1,
      //     listingLocation: 1,
      //     status: 1,
      //     verified: 1,
      //   }
      // );

      // find payable listings month wise
      let payableListingsMonthWise = await saveListingModal.aggregate([
        {
          $match: {
            listingId: { $in: allPayableListings },
          },
        },
        {
          $group: {
            _id: {
              // _id will be 04-2021
              $dateToString: { format: "%m-%Y", date: "$createdAt" },
            },
            count: { $sum: 1 },
            listings: {
              $push: {
                listingId: "$listingId",
                marketingName: "$marketingName",
                listingPrice: "$listingPrice",
                createdAt: "$createdAt",
                listingLocation: "$listingLocation",
                status: "$status",
                verified: "$verified",
              },
            },
            unpaidEarning: { $sum: oruMitraCons.earningPerListing },
            totalEarning: { $sum: oruMitraCons.earningPerListing },
          },
        },
      ]);

      payableListingsArray = payableListingsMonthWise;
    }

    // console.log("payableListingsArray", payableListingsArray);

    let paidListingsArray = [];

    if (paidListings.length > 0) {
      let allPaidListings = paidListings.map((item) => item.listingId);
      // paidListingsArray = await saveListingModal.find(
      //   {
      //     listingId: { $in: allPaidListings },
      //   },
      //   {
      //     listingId: 1,
      //     marketingName: 1,
      //     listingPrice: 1,
      //     createdAt: 1,
      //     listingLocation: 1,
      //     status: 1,
      //     verified: 1,
      //   }
      // );

      // find paid listings month wise
      let paidListingsMonthWise = await saveListingModal.aggregate([
        {
          $match: {
            listingId: { $in: allPaidListings },
          },
        },
        {
          $group: {
            _id: {
              // _id will be 04-2021
              $dateToString: { format: "%m-%Y", date: "$createdAt" },
            },
            count: { $sum: 1 },
            listings: {
              $push: {
                listingId: "$listingId",
                marketingName: "$marketingName",
                listingPrice: "$listingPrice",
                createdAt: "$createdAt",
                listingLocation: "$listingLocation",
                status: "$status",
                verified: "$verified",
              },
            },
            unpaidEarning: 0,
            totalEarning: { $sum: oruMitraCons.earningPerListing },
          },
        },
      ]);

      paidListingsArray = paidListingsMonthWise;
    }

    // console.log("paidListingsArray", paidListingsArray);

    let data = {
      payableAmount,
      paidAmount,
      payableListingsArray,
      paidListingsArray,
    };

    res.status(200).json({
      reason: `Feched earnings for given code: ${referralCode}`,
      statusCode: 200,
      status: "SUCCESS",
      dataObject: data,
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

router.get("/agent/update", async (req, res) => {
  try {
    let accessKey = req.query.accessKey;

    let admin = await adminCredModal.findOne({
      key: accessKey,
    });

    if (admin) {
      let type = req.query.type;
      let mobileNumber = req.query.mobileNumber;

      let email = req.query.email;
      let name = req.query.name;
      let status = req.query.status;
      let city = req.query.city;
      let address = req.query.address;
      let profilePicPath = req.query.profilePicPath;
      let permanentDelete = req.query.permanentDelete || false;

      switch (permanentDelete) {
        case "true":
          permanentDelete = true;
          break;
        case true:
          permanentDelete = true;
          break;
        case "false":
          permanentDelete = false;
          break;
        case false:
          permanentDelete = false;
          break;
        default:
          permanentDelete = false;
          break;
      }

      if (type == "Agent") {
        if (permanentDelete) {
          let agent = await createAgentModal.findOne({
            mobileNumber: mobileNumber,
            type: "Agent",
          });

          await agent.remove();

          res.status(200).json({
            reason: `Agent deleted successfully for the mobile number: ${mobileNumber}`,
            statusCode: 200,
            status: "SUCCESS",
            dataObject: agent,
          });
        } else {
          let agent = await createAgentModal.findOne({
            mobileNumber: mobileNumber,
          });

          if (email) {
            agent.email = email;
          }

          if (name) {
            agent.name = name;
          }

          if (status) {
            agent.status = status;
          }

          if (city) {
            agent.city = city;
          }

          if (address) {
            agent.address = address;
          }

          if (profilePicPath) {
            agent.profilePicPath = profilePicPath;
          }

          await agent.save();

          res.status(200).json({
            reason: `Agent updated successfully for the mobile number: ${mobileNumber}`,
            statusCode: 200,
            status: "SUCCESS",
            dataObject: agent,
          });
        }
      } else if (type == "OruMitra" || type == "Broker") {
        if (permanentDelete) {
          let agent = await createAgentModal.findOne({
            mobileNumber: mobileNumber,
            type: ["OruMitra", "Broker"],
          });

          await agent.remove();

          res.status(200).json({
            reason: `OruMitra deleted successfully for the mobile number: ${mobileNumber}`,
            statusCode: 200,
            status: "SUCCESS",
            dataObject: agent,
          });
        } else {
          let mitra = await createAgentModal.findOne({
            mobileNumber: mobileNumber,
          });

          if (email) {
            mitra.email = email;
          }

          if (name) {
            mitra.name = name;
          }

          if (status) {
            mitra.status = status;
          }

          if (city) {
            mitra.city = city;
          }

          if (address) {
            mitra.address = address;
          }

          if (profilePicPath) {
            mitra.profilePicPath = profilePicPath;
          }

          await mitra.save();

          res.status(200).json({
            reason: `OruMitra updated successfully for the mobile number: ${mobileNumber}`,
            statusCode: 200,
            status: "SUCCESS",
            dataObject: mitra,
          });
        }
      } else {
        res.status(200).json({
          reason: `Invalid type: ${type}`,
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      }
    } else {
      res.status(200).json({
        reason: `Invalid access key`,
        statusCode: 401,
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

module.exports = router;
