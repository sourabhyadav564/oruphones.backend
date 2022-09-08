const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const contactUsModal = require("../../src/database/modals/global/user_contact_us_modal");
const logEvent = require("../../src/middleware/event_logging");

const nodemailer = require("nodemailer");
const validUser = require("../../src/middleware/valid_user");
const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "eghguoshcuniexbf",
  },
});

router.post("/contactUs", validUser, logEvent, async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const mobile = req.body.mobile;
  const message = req.body.message;

  let dataToBeSave = {
    name: name,
    email: email,
    mobile: mobile,
    message: message,
  };
  try {
    const contactUs = new contactUsModal(dataToBeSave);
    const createContactUs = await contactUs.save();

    if (createContactUs) {

      let mailOptions = {
        from: "mobiruindia22@gmail.com",
        // to: "aman@zenro.co.jp, nishant.sharma@zenro.co.jp, anish@zenro.co.jp",
        to: "contact@oruphones.com",
        subject: "A new contact us request has been received",
        text:
        `Hi ${name},\n\nThank you for contacting us.\n\nYour email is: ${email}.\n\nYour contact number is: ${mobile}\n\nYour enquiry is: ${message}\n.`,
      };

      config.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + result.response);
        }
      });

      res.status(200).json({
        reason: "Contact us added",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: createContactUs,
      });
    } else {
      res.status(400).json({
        reason: "Contact us not added",
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
