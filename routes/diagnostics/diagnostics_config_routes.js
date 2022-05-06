const express = require("express");
const router = express.Router();
const logEvent = require("../../src/middleware/event_logging");
const generateRandomNumber = require("../../utils/generate_random_number");

require("../../src/database/connection");
const dignosticsConfigModal = require("../../src/database/modals/diagnostics/diagnostics_config");
const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const diagnosticsAllTests = require("../../src/database/modals/diagnostics/diagnostics_all_tests");

router.post("/diagConfig", async (req, res) => {
  const randomNumber = generateRandomNumber();
  let diagnosticsDataObject = await diagnosticsAllTests.find();

  let allTest = diagnosticsDataObject[0]["allTests"];
  let allDescriptions = diagnosticsDataObject[0]["allDescriptions"];
  let allTestCategory = diagnosticsDataObject[0]["allTestCategory"][0];

  let data = {};
  let category = [];
  // TODO: Physical test will be added soon in the future
  let physicalTests = [];
  let unavailableFeatures = req.body.unavailableFeatures;
  let make = req.body.make;
  let model = req.body.model;
  let latestFirmwareVersion = req.body.latestFirmwareVersion; //TODO: Need to get the latest firmware version every time
  let platform = req.body.platform;
  let batteryDesignCapacityQuick = req.body.batteryDesignCapacityQuick;
  let lastRestart = req.body.lastRestart;

  const filtered = (categoryType) => {
    let categoryObject = {};
    categoryObject["issueName"] = categoryType;
    categoryObject["displayname"] =
      allDescriptions[0][categoryType]["displayname"];
    categoryObject["description"] =
      allDescriptions[0][categoryType]["description"];

    categoryType =
      categoryType == "checkMyDevice" ? "RunAllDiagnostics" : categoryType;

    let testToBeSend = [];
    let autoTests = [];
    let manualTests = [];
    allTestCategory[categoryType].forEach((item) => {
      allTest.forEach((element) => {
        if (element.name === item) {
          testToBeSend.push(element);
        }
      });
    });

    testToBeSend.filter((item) => {
      if (unavailableFeatures.includes(item.name)) {
        testToBeSend.splice(testToBeSend.indexOf(item), 1);
      }
    });
    testToBeSend.filter((item) => {
      if (item.type === "Auto") {
        autoTests.push(item);
      } else {
        manualTests.push(item);
      }
    });
    categoryObject["autoTests"] = autoTests;
    categoryObject["manualTests"] = manualTests;
    return categoryObject;
  };

  if (req.body.transactionName === "VerifyDevice") {
    const verify_category = filtered("VerifyDevice");
    const check_category = filtered("checkMyDevice");
    category.push(verify_category);
    data["category"] = category;
    data["checkMyDevice"] = check_category;
    // console.log("validate1", data);
  } else {
    const battery_category = filtered("BatteryCharging");
    const system_crash_category = filtered("SystemCrash");
    const connectivity_category = filtered("Connectivity");
    const audio_vibrate_category = filtered("AudioVibrate");
    const camera_category = filtered("Camera");
    const display_touch_category = filtered("DisplayTouch");
    const run_all_category = filtered("RunAllDiagnostics");
    const check_category = filtered("checkMyDevice");
    category.push(battery_category);
    category.push(system_crash_category);
    category.push(connectivity_category);
    category.push(audio_vibrate_category);
    category.push(camera_category);
    category.push(display_touch_category);
    category.push(run_all_category);
    data["category"] = category;
    data["checkMyDevice"] = check_category;
    // console.log("validate2", data);
  }

  const getMarketingName = async (make, model) => {
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
              //  console.log("modelName", modelName);
            }
          });
        });
      });
      return modelName;
    } catch (error) {
      console.log("error", error);
    }
  };

  const getMarketingNameResult = await getMarketingName(make, model);
  let today = new Date();
  let hours = today.getHours() * 3600000;
  let minutes = today.getMinutes() * 60000;
  let seconds = today.getSeconds() * 1000;

  let miliseconds = hours + minutes + seconds;

  data["physicalTests"] = physicalTests;
  data["marketingName"] = getMarketingNameResult;
  data["certified"] = false;
  data["autobrightnessAvl"] = true;
  data["ownershipCheckProceed"] = true;
  data["deviceSupported"] = true;
  data["latestFirmware"] = true;
  data["runAllManualTests"] = false;
  data["latestFirmwareVersion"] = latestFirmwareVersion;
  data["callTestNumber"] = 121;
  data["pkeys"] = "VOLUME_UP,VOLUME_DOWN,POWER"; // TODO: Need to update according to the device
  data["vkeys"] = "BACK,HOME,MENU"; // TODO: Need to update according to the device
  data["iosBatteryHealthPer"] = platform === "Android" ? -1 : 100;
  data["sessionTimeoutInMins"] = 30;
  data["iosBatteryHealthStatus"] = platform === "Android" ? "SKIPPED" : "PASS";
  data["batteryDesignCapacity"] = batteryDesignCapacityQuick;
  data["lastRestartThresholdDays"] = Math.ceil(lastRestart / 86400000);
  data["unusedAppsThreshold"] = "5";
  data["currentServerTime"] = miliseconds;
  data["shortDateFormat"] = "dd/MM/yyyy";
  data["longDateFormat"] = "dd/MM/yyyy HH:mm";
  data["sohRange"] = [79, 90]; //TODO: Need to update according to the device and the battery design capacity
  data["fivePointCheck"] = [];
  data["generateRAN"] = false;
  data["enableRAPFeature"] = false;
  data["storeemail"] = "aman@zenro.co.jp";
  data["countryemail"] = "aman@zenro.co.jp";
  data["sendSummaryToStoreAndCentral"] = false;
  data["batteryConfig"] = {
    sohThreshold: 80,
    avgSohThreshold: 60,
    validSohThreshold: 5,
    deepdiveConfig: {
      percentDrop: 3,
      minBatteryLevel: 30,
    },
    gldProfile: "aaa",
  };
  data["serverWARVersion"] = "SSD-3.2.20211014.3";
  data["summaryDisplayElements"] = [
    "SuggestedFixes",
    "DeviceInfo",
    "BatteryTest",
    "TestResults",
  ];
  data["hybridTests"] = [];
  data["checkIMEIStolenStatus"] = true;
  data["enableEmailSummary"] = true;
  data["enableCSAT"] = true;
  data["enableIMEICapture"] = true;
  data["enableCosmeticCheck"] = false;
  data["enableCosmeticMirrorCheck"] = false;
  data["enableTradeInFlow"] = false;
  data["disableDiagIssuesSelection"] = false;
  data["disableSkipManualTestsOption"] = false;
  data["enableDiagTradeInFlow"] = false;

  const diagnosticsData = { ...req.body, sessionId: randomNumber };
  const saveDiagnosticsData = new dignosticsConfigModal(diagnosticsData);
  try {
    // const givedSavedData = await saveDiagnosticsData.save();
    res.status(201).json({
      message: "Valid store id",
      statusCode: 201,
      status: "SUCCESS",
      sessionId: parseInt(randomNumber),
      data: data,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
