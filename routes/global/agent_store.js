const express = require("express");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
const router = express.Router();
const createAgentModal = require("../../src/database/modals/global/oru_mitra/agent_modal");
const scrappedMitrasModal = require("../../src/database/modals/global/oru_mitra/scrapped_mitras");
const createUserModal = require("../../src/database/modals/login/login_create_user");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const generateOTP = require("../../utils/generate_otp");
const sendLoginOtp = require("../../utils/send_login_otp");

const codeStr = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.get("/agent/create", async (req, res) => {
  try {
    let mobileNumber = req.query.mobileNumber.toString();
    let name = req.query.name.toString();
    let email = req.query.email.toString();
    let address = req.query.address.toString();
    let city = req.query.city.toString();
    let code = codeStr();

    // generate random code of 6 char alpha-numeric for agent

    let agent = new createAgentModal({
      mobileNumber: mobileNumber,
      name: name,
      email: email,
      address: address,
      city: city,
      code: code,
      type: "Agent",
    });

    let result = await createAgentModal.findOne({
      // check if agent already exists or the code is already used
      $or: [{ mobileNumber: mobileNumber }, { code: code }],
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
        code = codeStr();
        agent.code = code;
        await agent.save().catch((err) => {
          res.status(500).json({
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
    res.status(500).json({
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
    let kiyoskId = req.body.kiyoskId.toString();
    let name = req.body.name.toString();
    let email = req.body.email.toString();
    let address = req.body.address.toString();
    let city = req.query.city.toString();
    let code = codeStr();
    let images = req.body.images.toString();
    let mobileNumber = req.body.mobileNumber.toString();
    let upiId = req.body.upiId.toString();
    let agentId = req.body.agentId.toString();

    // TODO: check if kiyoaskId is blacklisted or not

    let oruMitra = new createAgentModal({
      kiyoskId: kiyoskId,
      name: name,
      email: email,
      address: address,
      city: city,
      code: code,
      type: "OruMitra",
      images: images,
      mobileNumber: mobileNumber,
      upiId: upiId,
      agentId: agentId,
    });

    let result = await createAgentModal.findOne({
      // check if agent already exists or the code is already used
      $or: [
        { mobileNumber: mobileNumber },
        { code: code },
        { kiyoskId: kiyoskId },
      ],
    });

    let successMsg =
      "Congratulations!\n\n\nYou have successfully created OruMitra";

    if (result) {
      result = result._doc;
      if (result.mobileNumber.toString() == mobileNumber.toString()) {
        // agent already exists
        res.status(200).json({
          reason: "OruMitra already exists",
          statusCode: 200,
          status: "SUCCESS",
          dataObject: {},
        });
      } else {
        // code already exists
        code = codeStr();
        oruMitra.code = code;
        let dataObj = await oruMitra.save().catch((err) => {
          res.status(500).json({
            reason: "Internal server error",
            statusCode: 500,
            status: "FAILURE",
            dataObject: {
              error: err,
            },
          });
        });
        res.status(200).json({
          reason: "OruMitra created successfully",
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
        reason: "OruMitra created successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          ...dataObj._doc,
          successMsg: successMsg,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
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
    const mobileNumber = req.query.mobileNumber.toString();
    const countryCode = req.query.countryCode.toString();

    let foundUser = await createAgentModal.findOne({ mobileNumber });

    if (foundUser) {
      const clientOTP = generateOTP();

      const userDatas = {
        countryCode: countryCode,
        mobileNumber: mobileNumber,
        otp: clientOTP,
      };

      const data = new userModal(userDatas);
      const saveData = await data.save();
      const sendMessage = await sendLoginOtp(mobileNumber, clientOTP);
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
    } else {
      res.status(200).json({
        reason: "User not found",
        statusCode: 200,
        status: "FAILURE",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(500).json({
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
    const mobileNumber = req.query.mobileNumber?.toString();
    const countryCode = req.query.countryCode.toString();
    const otp = req.query.otp?.toString();

    const getOtp = await userModal.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
    });
    // savedOtp = getOtp[0]?.otp?.toString();
    let savedOtp = getOtp?.otp?.toString();
    if (savedOtp.toString() === otp.toString()) {
      const getUser = await createAgentModal.findOne(
        { mobileNumber },
        { type: 1, userUniqueId: 1, name: 1, mobileNumber: 1 }
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
    res.status(500).json({
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
    let agentUuId = req.query.userUniqueId.toString();
    let agentId = req.query.agentId.toString();

    let agent = await createAgentModal.findOne(
      {
        userUniqueId: agentUuId,
        agentId: agentId,
      },
      { _id: 0, __v: 0 }
    );

    if (agent) {
      if (agent.type == "Agent") {
        // get all oru mitras associated with this agent
        let oruMitra = await createAgentModal.find(
          {
            agentId: agentId,
            type: "OruMitra",
          },
          {
            kiyoskId: 1,
            name: 1,
            mobileNumber: 1,
            type: 1,
            address: 1,
            city: 1,
            status: 1,
            _id: 0,
            __v: 0,
          }
        );
        agent._doc.oruMitra = oruMitra;
      }

      res.status(200).json({
        reason: "Agent info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          agent: agent._doc,
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
    res.status(500).json({
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
    let kiyoaskId = req.query.kiyoaskId.toString();
    let agentUuId = req.query.userUniqueId.toString();

    // get oru mitra info
    let oruMitra = await createAgentModal.findOne(
      { kiyoaskId: kiyoaskId, userUniqueId: agentUuId },
      { _id: 0, __v: 0 }
    );

    if (oruMitra) {
      res.status(200).json({
        reason: "OruMitra info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          oruMitra: {
            ...oruMitra._doc,
            statusCode: "Already registered",
          },
        },
      });
    } else {
      let oruMitra = await scrappedMitrasModal.findOne({
        kiyoaskId: kiyoaskId,
      });
      if (oruMitra) {
        oruMitra = oruMitra._doc;
        let isBlacklisted = oruMitra.status == "Blacklisted" ? true : false;

        if (isBlacklisted) {
          res.status(200).json({
            reason: "OruMitra is blacklisted",
            statusCode: 200,
            status: "SUCCESS",
            dataObject: {
              oruMitra: oruMitra,
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
              oruMitra: oruMitra,
              statusCode: "Not registered",
            },
          });
        }
      } else {
        res.status(200).json({
          reason: "OruMitra not found",
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
    res.status(500).json({
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
    let kiyoaskId = req.query.kiyoaskId.toString();
    let agentUuId = req.query.userUniqueId.toString();

    // get oru mitra info
    let oruMitra = await createAgentModal.findOne(
      {
        kiyoaskId: kiyoaskId,
        userUniqueId: agentUuId,
      },
      { code: 1 }
    );

    if (oruMitra) {
      // get users with the code
      let users = await createUserModal.find(
        {
          associatedWith: oruMitra.code,
        },
        { userUniqueId: 1 }
      );

      let listings = await saveListingModal.find(
        {
          userUniqueId: { $in: users },
        },
        {
          listingDate: 1,
          make: 1,
          model: 1,
          deviceStorage: 1,
          deviceRam: 1,
          listingPrice: 1,
          mobileNumber: 1,
          verified: 1,
          verifiedDate: 1,
          status: 1,
        }
      );

      let totalVerified = 0;
      let totalListings = 0;

      listings.forEach((listing) => {
        listing.status = listing.status == "Active" ? "Linked" : listing.status;
        if (listing.verified) {
          totalVerified++;
        }
        totalListings++;
      });

      let totalEarnings = totalVerified * 5;

      let dataObject = {
        totalListings: totalListings,
        totalVerified: totalVerified,
        totalEarnings: totalEarnings,
        listings: listings,
      };

      res.status(200).json({
        reason: "OruMitra info",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: dataObject,
      });
    } else {
      res.status(200).json({
        reason: "OruMitra not found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {},
      });
    }
  } catch (error) {
    res.status(500).json({
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
