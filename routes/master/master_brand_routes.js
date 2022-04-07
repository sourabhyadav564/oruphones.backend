const express = require("express");
const router = express.Router();
const requestIp = require("request-ip");
var getIP = require('ipware')().get_ip;
var imei = require('node-imei');

require("../../src/database/connection");
const brandModal = require("../../src/database/modals/master/master_brands");

router.get("/brands", async (req, res) => {
  var IMEI= new imei();
  try {
    var clientIp = requestIp.getClientIp(req);
    var ipInfo = getIP(req);
    const dataObject = await brandModal.find();
    res
      .status(200)
      .json({
        reason: "Brands found",
        statusCode: 200,
        status: "SUCCESS",
        clientIp: clientIp,
        newIp: req.socket.remoteAddress,
        IMEI: [
          IMEI.random(),
          IMEI.device("OnePlus","OnePlus 8T"),
        ],
        ipInfo: ipInfo,
        dataObject,
      });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
