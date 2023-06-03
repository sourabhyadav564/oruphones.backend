const express = require("express");
const router = express.Router();

const { bestDealsNearMe,topSelling } = require("../../../utils/best_deals_helper_routes_v2");

router.get("/listings/best/nearme", async (req, res) => {
  const location = req.query.location;
  let page = req.query.pageNumber;
  page = parseInt(page.toString());
  const User = req.session.User;
  
  let userUniqueId = "Guest";
  if(User){
     userUniqueId = User.userUniqueId;
  }

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined || sortBy == "Featured" || sortBy == "undefined") {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  bestDealsNearMe(location, page, userUniqueId, sortBy, res);
});

router.get("/listings/best/topselling", async (req, res) => {
  const location = req.query.location;
  let page = req.query.pageNumber;
  let count = req.body.count;
  page = parseInt(page.toString());
  const User = req.session.User;

  
  let userUniqueId = "Guest";
  if(User){
     userUniqueId = User.userUniqueId;
  }

  let sortBy = req.query.sortBy;
  if (!sortBy) {
    sortBy = "NA";
  }
  if (sortBy == undefined || sortBy == "Featured" || sortBy == "undefined") {
    sortBy = "NA";
  } else {
    sortBy = sortBy;
  }

  topSelling(location, page, userUniqueId, sortBy, res, count);
});

module.exports = router;
