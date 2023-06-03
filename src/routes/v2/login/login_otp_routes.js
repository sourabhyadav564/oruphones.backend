const express = require("express");
const router = express.Router();
require("dotenv").config();
const session = require("express-session");
const generateOTP = require("../../../utils/generate_otp");
const sendLoginOtp = require("../../../utils/send_login_otp");
const userModal = require("../../../database/modals/login/login_otp_modal");
const logEvent = require('../../../middleware/log_event');

const moment = require("moment");
const createUserModal = require("../../../database/modals/login/login_create_user");




router.get("/get-session", (req, res) => {
  const sessionId = req.sessionID; // Retrieve the session ID from the cookie
  const User = req.session.User; // Retrieve the user ID from the session

  console.log(User);
  res.send(`Session ID: ${sessionId}\nUser ID: ${User}`);
});
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

    const sendMessage = sendLoginOtp(mobileNumber, clientOTP);

    // Store user details in the session

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

router.post("/otp/validate", async (req, res) => {
  const mobileNumber = req.query.mobileNumber?.toString();
  const countryCode = req.query.countryCode;
  const otp = req.query.otp?.toString();
  console.log(mobileNumber,countryCode,otp)

  try {
    const getOtp = await userModal.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
    });
    let savedOtp = getOtp?.otp?.toString();
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
            req.session.User = {
              mobileNumber: mobileNumber,
              countryCode: countryCode,
              userUniqueId: getUser.userUniqueId,
            };

            // Store session ID in Redis
            res.status(200).json({
              reason: "OTP validated",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                submitCountIncrement: 0,
                maxRetryCount: "3",
                mobileNumber: mobileNumber,
                userUniqueId: getUser.userUniqueId,
                sessionID: req.sessionID,
              },
            });
          } else {
            const data = new createUserModal(createUserData);
            const saveData = await data.save();

            // Store user details in the session
            req.session.User = {
              mobileNumber: mobileNumber,
              countryCode: countryCode,
              userUniqueId: saveData.userUniqueId,
            };

            // Store session ID in Redis

            res.status(200).json({
              reason: "OTP validated",
              statusCode: 200,
              status: "SUCCESS",
              dataObject: {
                submitCountIncrement: 0,
                maxRetryCount: "3",
                mobileNumber: mobileNumber,
                sessionID: req.sessionID,
              },
            });
          }
        } catch (error) {
          console.log(error);
          res.status(400).json(error);
        }
      }
    } else {
      res.status(200).json({
        reason: "You have entered an invalid OTP",
        statusCode: 200,
        status: {
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

module.exports = router;
