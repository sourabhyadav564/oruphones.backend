const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const filterModal = require("../../src/database/modals/master/show_search_filters");
const logEvent = require("../../src/middleware/event_logging");

router.get("/showsearchFilters", async (req, res) => {
  try {
    const dataObject = await filterModal.find();
    res
      .status(200)
      .json({
        reason: "Filters list fetched Successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
