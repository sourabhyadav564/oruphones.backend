const express = require("express");
const router = express.Router();

const subscriptionModal = require("../../src/database/modals/global/subscription_modal");
const logEvent = require("../../src/middleware/event_logging");
require("../../src/database/connection");

const nodemailer = require("nodemailer");
const validUser = require("../../src/middleware/valid_user");
const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "eghguoshcuniexbf",
  },
});


router.post("/addsubscription", validUser, logEvent, async (req, res) => {
  let email = req.query.email;

  let dataToBeSave = {
    email: email,
  }
  try {
    const subscription = new subscriptionModal(dataToBeSave);
    const createSubscription = await subscription.save();

    if (createSubscription) {

      let mailOptions = {
        from: "mobiruindia22@gmail.com",
        // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, anish@zenro.co.jp",
        to: "contact@oruphones.com",
        subject: "A new subscription request has been received",
        text:
        `Hi,\n\nThank you for subscribing.\n\nYour email is: ${email}.\n\n`,
      };

      config.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + result.response);
        }
      });

      res.status(200).json({
        reason: "Subscription added",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: createSubscription,
      });
    } else {
      res.status(400).json({
        reason: "Subscription not added",
        statusCode: 400,
        status: "FAILURE",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
