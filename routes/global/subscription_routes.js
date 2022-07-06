const express = require("express");
const router = express.Router();

const subscriptionModal = require("../../src/database/modals/global/subscription_modal");
require("../../src/database/connection");

router.post("/addsubscription", async (req, res) => {
  let email = req.query.email;

  let dataToBeSave = {
    email: email,
  }
  try {
    const subscription = new subscriptionModal(dataToBeSave);
    const createSubscription = await subscription.save();

    if (createSubscription) {
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
