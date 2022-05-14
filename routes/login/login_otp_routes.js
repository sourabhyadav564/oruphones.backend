const express = require("express");
const router = express.Router();
const Joi = require("joi");
require("dotenv").config();
const fast2sms = require("fast-two-sms");
const generateOTP = require("../../utils/generate_otp");

require("../../src/database/connection");
const userModal = require("../../src/database/modals/login/login_otp_modal");
const logEvent = require("../../src/middleware/event_logging");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

router.post("/otp/generate", async (req, res) => {
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

    var options = {
      authorization: process.env.API_KEY,
      message: `${clientOTP} is your OTP for login`,
      numbers: [mobileNumber],
    };

    const response = await fast2sms.sendMessage(options); //Asynchronous Function.

    res.status(200).json({
      reason: "OTP generated successfully",
      statusCode: 200,
      status: "SUCCESS",
      response,
      clientOTP: clientOTP,
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

router.post("/otp/validate", async (req, res) => {
  const mobileNumber = req.query.mobileNumber?.toString();
  const countryCode = req.query.countryCode;
  const otp = req.query.otp?.toString();

  try {
    const getOtp = await userModal.find({
      mobileNumber: mobileNumber,
      otp: otp,
    });
    savedOtp = getOtp[0]?.otp?.toString();
    if (savedOtp === otp) {
      res.status(200).json({
        reason: "OTP verified successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: {
          submitCountIncrement: 0,
          maxRetryCount: "3",
          mobileNumber: mobileNumber,
        },
      });
    } else {
      res.status(401).json({
        reason: "You have entered an invalid OTP",
        statusCode: 401,
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

router.post("/otp/resend", async (req, res) => {
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

    var options = {
      authorization: process.env.API_KEY,
      message: `${clientOTP} is your OTP for login`,
      numbers: [mobileNumber],
    };

    const response = await fast2sms.sendMessage(options); //Asynchronous Function.

    res.status(200).json({
      reason: "OTP generated successfully",
      statusCode: 200,
      status: "SUCCESS",
      response,
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
