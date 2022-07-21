const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const filterModal = require("../../src/database/modals/master/show_search_filters");
const logEvent = require("../../src/middleware/event_logging");

router.get("/showserchFilters", logEvent, async (req, res) => {
  try {
    // Data object for the search filters
    const data = await filterModal.find({}, { _id: 0 });
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
