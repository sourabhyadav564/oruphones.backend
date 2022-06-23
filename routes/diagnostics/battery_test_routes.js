const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const express = require("express");
const router = express.Router();

require("../../src/database/connection");

router.post("/batteryTest/mah", async (req, res) => {
  let make = req.body.make;
  let marketingName = req.body.marketingName;

  const getBatteryMah = async (make, marketingName) => {
    try {
      // FURTHER: use aggregate to get the data when complex query is needed
      let Object = await gsmarenaModal.aggregate([{ $match: { make: make } }]);

      let mAh = "";
      let makeArray = Object[0][make];
      // Get the model name from the make array based on the model number
      makeArray.forEach((item, index) => {
        let keys = [];
        for (let key in item) {
          if (key !== "_id") keys.push(key);
        }
        keys.forEach((key, i) => {
          let mKeys = [];
          if (key === marketingName) {
            for (let mKey in item[key]["Battery"]) {
              mKeys.push(mKey);
            }
          }
          mKeys.forEach((newKey, j) => {
            // console.log("Battery", item[key]["Misc"]["Models"])
            if (
              newKey.includes("Type")
              //   &&
              //   item[key]["Misc"]["Models"].includes(model)
            ) {
              // modelName = key;
              mAh = item[key]["Battery"]["Type"];
              mAh = parseInt(mAh.split('mAh')[0].replace(/\D/g, ""));
              //  console.log("modelName", modelName);
            }
          });
        });
      });
      // return `${mAh} mAh`;
      return mAh;
    } catch (error) {
      console.log("error", error);
    }
  };

  const getBatterymAhResult = await getBatteryMah(make, marketingName);

  try {
    if (!getBatterymAhResult) {
      res.status(204).json({
        status: 204,
        reason: "Battery mAh not found",
      });
    }
    res.status(200).json({
      status: 200,
      reason: "Battery mAh found successfully",
      batterymAh: getBatterymAhResult,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
