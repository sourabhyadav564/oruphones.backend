const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const brandModal = require("../../src/database/modals/master/make_modal_list");

router.get("/makemodellist", async (req, res) => {
  try {
    const dataObject = await brandModal.find();
    console.log(dataObject);
    res
      .status(200)
      .json({
        reason: "Modals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
