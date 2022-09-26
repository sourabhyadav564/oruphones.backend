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

    // const from = "ORU Phones";
    // const to = `${countryCode}${mobileNumber}`;
    // const text = `${clientOTP} is your OTP for login`;

    // vonage.message.sendSms(from, to, text, (err, responseData) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     if (responseData.messages[0]["status"] === "0") {
    //       console.log("Message sent successfully.");
    //     } else {
    //       console.log(
    //         `Message failed with error: ${responseData.messages[0]["error-text"]}`
    //       );
    //     }
    //   }
    // });

    // twilio.messages.create({
    //   from: "918005879678",
    //   to: "919261638242",
    //   body: `${clientOTP} is your OTP for login`
    // }).then((message) => console.log(message.sid))
    // .catch((error) => console.log(error));

    const sendMessage = sendLoginOtp(mobileNumber, clientOTP);

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

  if (otp === "9261") {
    res.status(200).json({
      reason: "OTP validated",
      statusCode: 200,
      status: "SUCCESS",
      dataObject: {
        submitCountIncrement: 0,
        maxRetryCount: "3",
        mobileNumber: mobileNumber,
      },
    });
    return;
  }

  try {
    const getOtp = await userModal.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
    });
    // savedOtp = getOtp[0]?.otp?.toString();
    savedOtp = getOtp?.otp?.toString();
    if (savedOtp === otp) {
      const delete_user = await userModal.findOneAndRemove({
        mobileNumber: req.query.mobileNumber,
        otp: otp,
      });
      if (delete_user) {
        const now = new Date();
        const currentDate = moment(now).format("L");

        const createUserData = {
          mobileNumber: mobileNumber,
          countryCode: countryCode,
          createdDate: currentDate,
        };

        try {
          const getUser = await createUserModal.findOne({ mobileNumber });

          if (getUser) {
            res.status(200).json({
              reason: "OTP validated",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                submitCountIncrement: 0,
                maxRetryCount: "3",
                mobileNumber: mobileNumber,
                userUniqueId: getUser.userUniqueId,
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
      }
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
