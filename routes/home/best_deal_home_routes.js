const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const { bestDealsNearMe } = require("../../utils/best_deals_helper_routes");

router.get("/listings/best/nearme", async (req, res) => {
  const location = req.query.location;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());
  const userUniqueId = req.headers.useruniqueid;
  bestDealsNearMe(location, page, userUniqueId, res);
});

module.exports = router;
