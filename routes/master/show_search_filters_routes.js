const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const filterModal = require("../../src/database/modals/master/show_search_filters");
const logEvent = require("../../src/middleware/event_logging");
const validUser = require("../../src/middleware/valid_user");

router.get("/showserchFilters", validUser, logEvent, async (req, res) => {
  try {
    // Data object for the search filters
    const data = await filterModal.find({}, { _id: 0, Color: 0 });
    const dataObject = data[0]
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
