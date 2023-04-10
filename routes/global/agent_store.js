const express = require("express");
const router = express.Router();
const createAgentModal = require("../../src/database/modals/global/agent_modal");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const generateOTP = require("../../utils/generate_otp");

const codeStr = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.get("/agent/create", async (req, res) => {
  try {
    let mobileNumber = req.query.mobileNumber;
    let name = req.query.name;
    let email = req.query.email;
    let address = req.query.address;
    let city = req.query.city;
    let code = codeStr();

    // generate random code of 6 char alpha-numeric for agent

    let agent = new createAgentModal({
      mobileNumber: mobileNumber,
      name: name,
      email: email,
      address: address,
      city: city,
      code: code,
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

router.get("/agent/login", async (req, res) => {
  try {
    const mobileNumber = req.query.mobileNumber;
    const countryCode = req.query.countryCode;
    const clientOTP = generateOTP();

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
    const countryCode = req.query.countryCode;
    const otp = req.query.otp?.toString();

    const getOtp = await userModal.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
    });
    // savedOtp = getOtp[0]?.otp?.toString();
    let savedOtp = getOtp?.otp?.toString();
    if (savedOtp.toString() == otp.toString()) {
      const getUser = await createAgentModal.findOne({ mobileNumber });

      res.status(200).json({
        reason: "OTP validated",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          //   mobileNumber: mobileNumber,
          //   userUniqueId: getUser.userUniqueId,
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

module.exports = router;
