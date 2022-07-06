const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const contactUsModal = require("../../src/database/modals/global/user_contact_us_modal");

router.post("/contactUs", async (req, res) => {
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
      res.status(200).json({
        reason: "Subscription added",
        statusCode: 200,
        status: "SUCCESS",
        dataObject: createContactUs,
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
