const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const logEvent = require("../../src/middleware/event_logging");
const getDefaultImage = require("../../utils/get_default_image");
// const connection = require("../../src/database/mysql_connection");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const newMakeAndModal = require("../../src/database/modals/others/new_make_and_model");

router.post("/marketingNameByModel", async (req, res) => {
  const deviceStorage = req.body.deviceStorage;
  const model = req.body.model;
  let make = req.body.make;
  const ram = req.body.ram;
  // const marketingName = req.body.marketingName;

  // let newMake = make.split(" ").map((currentValue) => {
  //   let newText = currentValue[0].toUpperCase() + currentValue.slice(1);
  //   return newText;
  // });

  // make = newMake[0]

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

  try {
    // FURTHER: use aggregate to get the data when complex query is needed
    // let Object = await gsmarenaModal.aggregate([{ $match: { make: make } }]);
    let objects = {}
    if (make != "Apple") {
    objects = await newMakeAndModal.find({
      make: make,
      models: { $in: model },
    });
  } else {
    objects = await newMakeAndModal.find({
      make: make,
      // marketingName: {"$regex": model, "$options": "i"},
      marketingName: `${make} ${model}`,
    });
  }
    let modelName = objects[0].marketingName;
    console.log("objects", objects);
    // let modelName = "";
    // let makeArray = Object[0][make];
    // // Get the model name from the make array based on the model number
    // makeArray.forEach((item, index) => {
    //   let keys = [];
    //   for (let key in item) {
    //     if (key !== "_id") keys.push(key);
    //   }
    //   keys.forEach((key, i) => {
    //     let mKeys = [];
    //     for (let mKey in item[key]["Misc"]) {
    //       mKeys.push(mKey);
    //     }
    //     mKeys.forEach((newKey, j) => {
    //       if (
    //         newKey.includes("Models") &&
    //         item[key]["Misc"]["Models"].includes(model)
    //       ) {
    //         modelName = key;
    //       }
    //     });
    //   });
    // });

    const image = await getDefaultImage(modelName);
    console.log("image", image);

    try {
      const marketingname = modelName;
      const condition = "Like New";
      // const storage = req.body.deviceStorage.split(" ")[0].toString();
      const storage = req.body.deviceStorage;
      const hasCharger = true;
      const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
      const hasEarphone = true;
      const isAppleEarphoneIncluded = make === "Apple" ? hasEarphone : false;
      const hasOrignalBox = true;
      const isVarified = true;

      const price = await getRecommendedPrice(
        make,
        marketingname,
        condition,
        storage,
        hasCharger,
        isAppleChargerIncluded,
        hasEarphone,
        isAppleEarphoneIncluded,
        hasOrignalBox,
        isVarified,
        true
      );

      let dataObject = {
        deviceStorage: deviceStorage,
        deviceRam: ram,
        marketingName: modelName,
        // imagePath: `https://zenrodeviceimages.s3-us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make
        //   .toString()
        //   .toLowerCase()}/mbr_${modelName.toLowerCase().replace(" ", "_")}.png`,
        imagePath: image,
        price:
          Object.keys(price).length > 0
            ? price.maxsellingprice.toString()
            : "--",
      };

      res.status(200).json({
        reason: "Modals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/makemodellist", logEvent, async (req, res) => {
  let make = req.query.make;
  const isPrimary = req.query.isPrimary;

  if (make) {
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
      case "google":
        make = "Google";
        break;
      case "honor":
        make = "Honor";
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
      case "realme":
        make = "Realme";
        break;
      case "blackberry":
        make = "Blackberry";
        break;
      case "htc":
        make = "HTC";
        break;
      case "huawei":
        make = "Huawei";
        break;
      case "panasonic":
        make = "Panasonic";
        break;
      case "zte":
        make = "ZTE";
        break;
      case "alcatel":
        make = "Alcatel";
        break;
      case "gionee":
        make = "Gionee";
        break;
      case "lava":
        make = "Lava";
        break;
      case "tecno":
        make = "Tecno";
        break;
    }
  }
  // let dataObject = [];
  // let newModels = [];
  // let makes = await gsmarenaModal.find({}, { make: 1, _id: 0 });
  // let allBrand = [];
  // makes.forEach((item) => {
  //   let currentBrand = Object.values(item)[2].make;
  //   allBrand.push(currentBrand);
  // });

  // allBrand.forEach(async (brandName) => {
  //   // Loop through the makes will be starting from here
  //   let models = await gsmarenaModal.aggregate([
  //     { $match: { make: brandName } },
  //   ]);

  //   let modelArray = await models[0][brandName];
  //   let newModels = [];

  //   modelArray.forEach((item, index) => {
  //     let marketingname = "";
  //     let color = [];
  //     let storage = [];
  //     let keys = [];
  //     for (let key in item) {
  //       if (key !== "_id") keys.push(key);
  //     }
  //     keys.forEach((key, i) => {
  //       marketingname = key;
  //       let mKeys = [];
  //       for (let mKey in item[key]["Misc"]) {
  //         mKeys.push(mKey);
  //       }

  //       mKeys.forEach((colorKey, j) => {
  //         if (colorKey.includes("Colors")) {
  //           color = item[key]["Misc"]["Colors"].split(", ");
  //         }
  //       });

  //       let memKeys = [];
  //       for (let memKey in item[key]["Memory"]) {
  //         memKeys.push(memKey);
  //       }

  //       memKeys.forEach((storageKey, j) => {
  //         if (storageKey.includes("Internal")) {
  //           let storageArray = item[key]["Memory"]["Internal"].split(", ");
  //           let intStorage;
  //           let finalStorageArray = [];
  //           storageArray.forEach((storageItem) => {
  //             intStorage = storageItem
  //               .split(" ")
  //               .find((item) => item.indexOf("GB"))
  //               .slice(0, -2);
  //             // console.log("int", intStorage);
  //             finalStorageArray.push(intStorage + " GB");
  //           });
  //           // storage = item[key]["Memory"]["Internal"].split(", ");
  //           storage = finalStorageArray;
  //         }
  //       });
  //     });

  //     newModels.push({
  //       marketingname,
  //       color,
  //       storage,
  //     });
  //   });

  //   dataObject.push({
  //     make: brandName,
  //     models: newModels,
  //   });

  //   if (allBrand.length === dataObject.length) {
  //     res.status(200).json({
  //       reason: "Modals found",
  //       statusCode: 200,
  //       status: "SUCCESS",
  //       dataObject,
  //     });
  //   }
  // });

  let object;
  if (isPrimary === "Y") {
    object = await newMakeAndModal.find({ make: make });
  } else {
    object = await newMakeAndModal.find({
      make: [
        "Samsung",
        "Apple",
        "OnePlus",
        "Xiaomi",
        "Google",
        "Honor",
        "Realme",
        "Blackberry",
        "HTC",
        "Nokia",
        "LG",
        "Motorola",
        "Huawei",
        "Panasonic",
        "ZTE",
        "Alcatel",
        "Sony",
        "Lenovo",
        "Asus",
        "Vivo",
        "Oppo",
        "Infinix",
        "Micromax",
        "Karbonn",
        "Lava",
        "Gionee",
        "Tenco",
      ],
    });
  }

  let dataObject = [];
  let makes = [];

  object.forEach((item, index) => {
    let newModels = [];
    newModels.push({
      marketingname: item.marketingName,
      color: item.color,
      storage: item.storage,
      ram: item.ram,
    });

    if (!makes.includes(item.make)) {
      dataObject.push({
        make: item.make,
        models: newModels,
      });
    } else {
      dataObject.forEach((item2, index) => {
        if (item2.make === item.make) {
          item2.models.push({
            marketingname: item.marketingName,
            color: item.color,
            storage: item.storage,
            ram: item.ram,
          });
        }
      });
    }

    makes.push(item.make);

    if (index === object.length - 1) {
      res.status(200).json({
        reason: "Modals found",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  });
});

module.exports = router;
