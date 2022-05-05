const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const logEvent = require("../../src/middleware/event_logging");

router.post("/marketingNameByModel", async (req, res) => {
  const deviceStorage = req.body.deviceStorage;
  const model = req.body.model;
  const make = req.body.make;
  const ram = req.body.ram;

  try {
    // FURTHER: use aggregate to get the data when complex query is needed
    let Object = await gsmarenaModal.aggregate([{ $match: { make: make } }]);

    let modelName = "";
    let makeArray = Object[0][make];
    // Get the model name from the make array based on the model number
    makeArray.forEach((item, index) => {
      let keys = [];
      for (let key in item) {
        if (key !== "_id") keys.push(key);
      }
      keys.forEach((key, i) => {
        let mKeys = [];
        for (let mKey in item[key]["Misc"]) {
          mKeys.push(mKey);
        }
        mKeys.forEach((newKey, j) => {
          if (
            newKey.includes("Models") &&
            item[key]["Misc"]["Models"].includes(model)
          ) {
            modelName = key;
          }
        });
      });
    });

    let dataObject = {
      deviceStorage: deviceStorage,
      marketingName: modelName,
      imagePath:
        "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/apple/mbr_Apple_iPhone_12_mini.png",
      price: "20,000",
    };

    res.status(200).json({
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

router.get("/makemodellist", async (req, res) => {
  let dataObject = [];
  let makes = await gsmarenaModal.find({}, { make: 1, _id: 0 });
  let allBrand = [];
  makes.forEach((item) => {
    let currentBrand = Object.values(item)[2].make
    allBrand.push(currentBrand);
  })

  allBrand.forEach(async (brandName) => {

  // Loop through the makes will be starting from here
  let models = await gsmarenaModal.aggregate([{ $match: { make: brandName } }]);

  let modelArray = await models[0][brandName];
  let newModels = [];

  modelArray.forEach((item, index) => {
    let marketingname = "";
    let color = [];
    let storage = [];
    let keys = [];
    for (let key in item) {
      if (key !== "_id") keys.push(key);
    }
    keys.forEach((key, i) => {
      marketingname = key;
      let mKeys = [];
      for (let mKey in item[key]["Misc"]) {
        mKeys.push(mKey);
      }

      mKeys.forEach((colorKey, j) => {
        if (colorKey.includes("Colors")) {
          color = item[key]["Misc"]["Colors"].split(",");
        }
      });

      let memKeys = [];
      for (let memKey in item[key]["Memory"]) {
        memKeys.push(memKey);
      }

      memKeys.forEach((storageKey, j) => {
        if (storageKey.includes("Internal")) {
          storage = item[key]["Memory"]["Internal"].split(",");
        }
      });
    });

    newModels.push({
      marketingname,
      color,
      storage,
    });
  });

  dataObject.push({
    make: brandName,
    models: newModels,
  });

  if(allBrand.length === dataObject.length){
    res.status(200).json({
      reason: "Modals found",
      statusCode: 200,
      status: "SUCCESS",
      dataObject,
    });
  }
})
});

module.exports = router;
