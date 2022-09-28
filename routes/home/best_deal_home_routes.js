const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const { bestDealsNearMe } = require("../../utils/best_deals_helper_routes");

router.get("/listings/best/nearme", async (req, res) => {
  const location = req.query.location;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());
  const userUniqueId = req.headers.useruniqueid;

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "undefined";
  }
  if (sortBy == undefined || sortBy == "Featured") {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  bestDealsNearMe(location, page, userUniqueId, sortBy, res);
});

module.exports = router;
