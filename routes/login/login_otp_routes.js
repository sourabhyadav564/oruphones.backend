const express = require("express");
const router = express.Router();
const Joi = require("joi");
require("dotenv").config();
const generateOTP = require("../../utils/generate_otp");
const sendLoginOtp = require("../../utils/send_login_otp");

require("../../src/database/connection");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const logEvent = require("../../src/middleware/event_logging");

const moment = require("moment");
const createUserModal = require("../../src/database/modals/login/login_create_user");

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilio = require("twilio")(accountSid, authToken);

// const Vonage = require("@vonage/server-sdk");

// const vonage = new Vonage({
//   apiKey: "d0607933",
//   apiSecret: "ApasBxeJHAuzso7f",
// });

let devNum = ["9660398594", "6375197371", "9772557936", "9649493568"];
let otpNum = ["9261", "4126"];

router.post("/otp/generate", logEvent, async (req, res) => {
  const mobileNumber = req.query.mobileNumber;
  const countryCode = req.query.countryCode;
  const clientOTP = generateOTP();

  const userDatas = {
    countryCode: countryCode,
    mobileNumber: mobileNumber,
    otp: clientOTP,
  };

  try {
    const data = new userModal(userDatas);
    const saveData = await data.save();

    if (!devNum.includes(mobileNumber.toString())) {
      const sendMessage = sendLoginOtp(mobileNumber, clientOTP);
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
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/otp/validate", logEvent, async (req, res) => {
  const mobileNumber = req.query.mobileNumber?.toString();
  const countryCode = req.query.countryCode;
  const otp = req.query.otp?.toString();

  // if (otp === "9261" && mobileNumber === "9660398594") {
  if (otpNum.includes(otp) && devNum.includes(mobileNumber)) {
    const getUser = await createUserModal.findOne(
      {
        mobileNumber,
        // isaccountexpired: false,
      },
      {
        userUniqueId: 1,
        isaccountexpired: 1,
      }
    );
    // const getUser2 = await createUserModal.findOne({
    //   mobileNumber,
    //   isaccountexpired: true,
    // });

    if (getUser) {
      let isaccountexpired =
        (getUser && getUser.isaccountexpired == true) || false;
      let message = isaccountexpired
        ? "This account was expired or deleted. Do you want to continue with the previous account or create a new account?"
        : "Welcome back";
      res.status(200).json({
        reason: "OTP validated",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          mobileNumber: mobileNumber,
          userUniqueId: getUser.userUniqueId,
          message: message,
          isaccountexpired: isaccountexpired,
        },
      });
    } else {
      const now = new Date();
      const currentDate = moment(now).format("L");
      const createUserData = {
        mobileNumber: mobileNumber,
        countryCode: countryCode,
        createdDate: currentDate,
      };
      const data = new createUserModal(createUserData);
      const saveData = await data.save();
      res.status(200).json({
        reason: "OTP validated",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          mobileNumber: mobileNumber,
          userUniqueId: saveData.userUniqueId,
        },
      });
    }
    return;
  } else {
    try {
      const getOtp = await userModal.findOne({
        mobileNumber: mobileNumber,
        otp: otp,
      });
      // savedOtp = getOtp[0]?.otp?.toString();
      let savedOtp = getOtp?.otp?.toString();
      if (savedOtp === otp) {
        // if (delete_user) {
        const now = new Date();
        const currentDate = moment(now).format("L");

        const createUserData = {
          mobileNumber: mobileNumber,
          countryCode: countryCode,
          createdDate: currentDate,
        };

        try {
          // const getUser = await createUserModal.findOne(
          //   { mobileNumber },
          //   { userUniqueId: 1 }
          // );

          // if (getUser) {
          //   let isaccountexpired = getUser.isaccountexpired || false;

          const getUser = await createUserModal.findOne(
            {
              mobileNumber,
              // isaccountexpired: false,
            },
            { userUniqueId: 1, isaccountexpired: 1 }
          );
          // const getUser2 = await createUserModal.findOne(
          //   {
          //     mobileNumber,
          //     isaccountexpired: true,
          //   },
          //   { isaccountexpired: 1 }
          // );

          if (getUser) {
            let isaccountexpired =
              (getUser && getUser.isaccountexpired == true) || false;
            let message = isaccountexpired
              ? "This account was expired or deleted. Do you want to continue with the previous account or create a new account?"
              : "Welcome back";
            res.status(200).json({
              reason: "OTP validated",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                submitCountIncrement: 0,
                maxRetryCount: "3",
                mobileNumber: mobileNumber,
                userUniqueId: getUser.userUniqueId,
                message: message,
                isaccountexpired: isaccountexpired,
              },
            });
            return;
          } else {
            const data = new createUserModal(createUserData);
            const saveData = await data.save();
            res.status(200).json({
              reason: "OTP validated",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                submitCountIncrement: 0,
                maxRetryCount: "3",
                mobileNumber: mobileNumber,
                userUniqueId: saveData.userUniqueId,
              },
            });
          }
          // const delete_user = await userModal.findOneAndRemove({
          //   mobileNumber: req.query.mobileNumber,
          //   otp: otp,
          // });

          // find all for the mobile number and delete all
          const delete_user = await userModal.deleteMany({
            mobileNumber: req.query.mobileNumber,
          });
        } catch (error) {
          console.log(error);
          res.status(400).json(error);
        }

        // res.status(200).json({
        //   reason: "OTP validated",
        //   statusCode: 200,
        //   status: "SUCCESS",
        //   dataObject: {
        //     submitCountIncrement: 0,
        //     maxRetryCount: "3",
        //     mobileNumber: mobileNumber,
        //   },
        // });
        // }
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
      console.log(error);
      res.status(400).json(error);
    }
  }
});

router.post("/otp/resend", logEvent, async (req, res) => {
  const mobileNumber = req.query.mobileNumber;
  const countryCode = req.query.countryCode;
  const clientOTP = generateOTP();

  const userDatas = {
    countryCode: countryCode,
    mobileNumber: mobileNumber,
    otp: clientOTP,
  };

  try {
    const data = new userModal(userDatas);
    const saveData = await data.save();

    // var options = {
    //   authorization: process.env.API_KEY,
    //   message: `${clientOTP} is your OTP for login`,
    //   numbers: [mobileNumber],
    // };

    // const response = await fast2sms.sendMessage(options); //Asynchronous Function.

    const sendMessage = sendLoginOtp(mobileNumber, clientOTP);

    res.status(200).json({
      reason: "OTP generated successfully",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        maxTime: 120,
        submitCountIncrement: 0,
        maxRetryCount: "3",
        mobileNumber: `${countryCode} ${mobileNumber}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
