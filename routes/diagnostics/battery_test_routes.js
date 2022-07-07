const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const express = require("express");
const logEvent = require("../../src/middleware/event_logging");
const router = express.Router();

require("../../src/database/connection");

router.post("/batteryTest/mah", async (req, res) => {
  let make = req.body.make;
  let marketingName = req.body.marketingName;

  let tempMake = make.toLowerCase();

  switch (tempMake) {
    case "samsung":
      make = "Samsung";
      break;
    case "oneplus":
      make = "OnePlus";
      break;
    case "huawei":
      make = "Huawei";
      break;
    case "xiaomi":
      make = "Xiaomi";
      break;
    case "vivo":
      make = "Vivo";
      break;
    case "oppo":
      make = "Oppo";
      break;
    case "google":
      make = "Google";
      break;
    case "htc":
      make = "HTC";
      break;
    case "lenovo":
      make = "Lenovo";
      break;
    case "apple":
      make = "Apple";
      break;
    case "sony":
      make = "Sony";
      break;
    case "nokia":
      make = "Nokia";
      break;
    case "infinix":
      make = "Infinix";
      break;
    case "acer":
      make = "Acer";
      break;
    case "asus":
      make = "Asus";
      break;
    case "honor":
      make = "Honor";
      break;
    case "microsoft":
      make = "Microsoft";
      break;
    case "lg":
      make = "LG";
      break;
    case "alcatel":
      make = "Alcatel";
      break;
    case "micromax":
      make = "Micromax";
      break;
    case "motorola":
      make = "Motorola";
      break;
    case "panasonic":
      make = "Panasonic";
      break;
    case "realme":
      make = "Realme";
      break;
    case "tenco":
      make = "Tenco";
      break;
    case "lava":
      make = "Lava";
      break;
    case "gionee":
      make = "Gionee";
      break;
  }

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
