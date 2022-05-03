const express = require("express");
const router = express.Router();
const logEvent = require("../../src/middleware/event_logging");
const generateRandomNumber = require("../../utils/generate_random_number");

require("../../src/database/connection");
const dignosticsConfigModal = require("../../src/database/modals/diagnostics/diagnostics_config");
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

  const filtered = (categoryType) => {

    let categoryObject = {};
    categoryObject["issueName"] = categoryType;
    categoryObject["displayname"] = allDescriptions[0][categoryType]["displayname"];
    categoryObject["description"] = allDescriptions[0][categoryType]["description"];

    categoryType = categoryType == "checkMyDevice" ? "RunAllDiagnostics" : categoryType;

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
    console.log("validate1", data);
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
    console.log("validate2", data);
  }

  const diagnosticsData = { ...req.body, sessionId: randomNumber };
  const saveDiagnosticsData = new dignosticsConfigModal(diagnosticsData);
  try {
    // const givedSavedData = await saveDiagnosticsData.save();
    res.status(201).json({
      message: "Valid store id",
      statusCode: 201,
      status: "SUCCESS",
      sessionId: randomNumber,
      // diagnosticsDataObject: diagnosticsDataObject,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
