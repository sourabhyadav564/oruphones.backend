const express = require("express");
const router = express.Router();
const logEvent = require("../../src/middleware/event_logging");
const generateRandomNumber = require("../../utils/generate_random_number");
const fs = require("fs");

require("../../src/database/connection");
const dignosticsConfigModal = require("../../src/database/modals/diagnostics/diagnostics_config");
const gsmarenaModal = require("../../src/database/modals/master/marketing_name_by_model");
const diagnosticsAllTests = require("../../src/database/modals/diagnostics/diagnostics_all_tests");
const saveListingModal = require("../../src/database/modals/device/save_listing_device");
// const connection = require("../../src/database/mysql_connection");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const questionModal = require("../../src/database/modals/master/get_question");
const dignosticsLogsModal = require("../../src/database/modals/diagnostics/diagnostics_log_transection");

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
  let latestFirmwareVersion = req.body.firmware; //TODO: Need to get the latest firmware version every time
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

    let finalAT = [];
    let finalMT = [];
    autoTests.forEach((item) => {
      let it = {};
      it["name"] = item.name;
      it["displayname"] = item.displayname;
      it["category"] = item.category;
      it["severity"] = item.severity;
      it["status"] = item.status;
      it["testCode"] = item.testCode;

      finalAT.push(it);
    });
    manualTests.forEach((item) => {
      let it = {};
      it["name"] = item.name;
      it["displayname"] = item.displayname;
      it["category"] = item.category;
      it["severity"] = item.severity;
      it["status"] = item.status;
      it["testCode"] = item.testCode;

      finalMT.push(it);
    });

    if (
      finalAT.length === autoTests.length &&
      finalMT.length === manualTests.length
    ) {
      categoryObject["autoTests"] = finalAT;
      categoryObject["manualTests"] = finalMT;
      return categoryObject;
    }

    // categoryObject["autoTests"] = autoTests;
    // categoryObject["manualTests"] = manualTests;
    // return categoryObject;
  };

  if (req.body.transactionName === "VerifyDevice") {
    const verify_category = filtered("VerifyDevice");
    const check_category = filtered("checkMyDevice");
    category.push(verify_category);
    data["category"] = category;
    data["checkMyDevice"] = check_category;
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
  data["callTestNumber"] = "121";
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
      data: data,
      status: "SUCCESS",
      message: "Valid store id",
      sessionId: parseInt(randomNumber),
      // statusCode: 201,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/grade/price", logEvent, async (req, res) => {
  const companyId = req.body.companyId;
  const diagSessionId = req.body.diagSessionId;
  const functionalTestResults = req.body.functionalTestResults;
  const listingId = req.body.listingId;
  const questionnaireResults = req.body.questionnaireResults;
  const deviceUniqueId = req.body.deviceUniqueId;
  const ram = req.body.ram;
  const userUniqueId = req.body.userUniqueId;

  const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
  const deviceFinalGrade = req.body.deviceFinalGrade;
  const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
  const saveData = req.body.saveData;

  try {
    const severityLow = [
      "RotationVectorSensorTest",
      "BarometerTest",
      "MagneticSensorTest",
      "LinearAccelerationSensorTest",
    ];
    const severityMedium = [
      "VibrationTest",
      "BluetoothOffTest",
      "BluetoothOnTest",
      "BluetoothToggleTest",
      "QuickBatteryAutoTest",
      "WLANOnTest",
      "GameRotationSensorTest",
      "GyroscopeSensorTest",
      "Mic2Test",
    ];
    const severityHigh = [
      "GenuineOSTest",
      "SpeakerTest",
      "FrontCameraPictureTest",
      "EarpieceTest",
      "RearCameraPictureTest",
      "MicTest",
    ];

    let grade;
    let cosmeticGrade;
    let finalGrade;
    let condition;
    let count = 0;
    let lCount = 0;
    let index = 0;

    const getQuestions = await questionModal.find({});

    for (item of functionalTestResults) {
      if (severityHigh.includes(item.commandName)) {
        if (item.testStatus !== "PASS") {
          // grade = "C";
          grade = "D";
          // condition = "Fair";
          condition = "Needs Repair";
          break;
        }
      } else if (severityMedium.includes(item.commandName)) {
        if (item.testStatus !== "PASS") {
          if (count <= 3) {
            // grade = "B";
            // condition = "Good";
            grade = "D";
            condition = "Needs Repair";
            count++;
          } else {
            grade = "C";
            condition = "Fair";
            count = 0;
            break;
          }
        }
      } else if (severityLow.includes(item.commandName)) {
        if (item.testStatus !== "PASS") {
          if (lCount <= 3) {
            grade = "A";
            condition = "Excellent";
          } else {
            grade = "B";
            condition = "Good";
            break;
          }
          lCount++;
        }
      }
      index++;
      if (
        index >= functionalTestResults.length &&
        count === 0 &&
        lCount === 0
      ) {
        grade = "S";
        condition = "Like New";
        break;
      }
    }

    // for (item of questionnaireResults) {
    //   if (item.questionId === 1 && item.childQuestions.length > 0) {
    //     if (item.childQuestions.length === 3) {
    //       cosmeticGrade = "C";
    //       break;
    //     } else if (item.childQuestions.length === 2) {
    //       cosmeticGrade = "B";
    //       break;
    //     } else if (
    //       item.childQuestions.includes(3) ||
    //       item.childQuestions.includes(5)
    //     ) {
    //       cosmeticGrade = "B";
    //       break;
    //     } else if (item.childQuestions.includes(4)) {
    //       cosmeticGrade = "A";
    //       break;
    //     }
    //   } else if (item.questionId === 6 && item.childQuestions.length > 0) {
    //     if (item.childQuestions.length >= 3) {
    //       cosmeticGrade = "C";
    //       break;
    //     } else if (item.childQuestions.length === 2) {
    //       if (
    //         item.childQuestions.includes(7) &&
    //         item.childQuestions.includes(8)
    //       ) {
    //         cosmeticGrade = "C";
    //         break;
    //       } else if (
    //         (item.childQuestions.includes(7) &&
    //           item.childQuestions.includes(9)) ||
    //         (item.childQuestions.includes(7) &&
    //           item.childQuestions.includes(10)) ||
    //         (item.childQuestions.includes(8) &&
    //           item.childQuestions.includes(9)) ||
    //         (item.childQuestions.includes(8) &&
    //           item.childQuestions.includes(10))
    //       ) {
    //         cosmeticGrade = "B";
    //         break;
    //       } else if (
    //         item.childQuestions.includes(9) ||
    //         item.childQuestions.includes(10)
    //       ) {
    //         cosmeticGrade = "A";
    //       }
    //     } else if (
    //       item.childQuestions.includes(7) ||
    //       item.childQuestions.includes(8)
    //     ) {
    //       cosmeticGrade = "B";
    //       break;
    //     } else if (
    //       item.childQuestions.includes(9) ||
    //       item.childQuestions.includes(10)
    //     ) {
    //       cosmeticGrade = "A";
    //       break;
    //     }
    //   } else if (item.childQuestions.length === 0) {
    //     cosmeticGrade = "S";
    //   }
    // }

    let warrantyPeriod;
    // for (item of questionnaireResults) {
    //   if (item.questionId === 11 && item.childQuestions.length > 0) {
    //     if (item.childQuestions[0] == "12" || item.childQuestions[0] == 12) {
    //       warrantyPeriod = "zero";
    //     } else if (
    //       item.childQuestions[0] == "13" ||
    //       item.childQuestions[0] == 13
    //     ) {
    //       warrantyPeriod = "four";
    //     } else if (
    //       item.childQuestions[0] == "14" ||
    //       item.childQuestions[0] == 14
    //     ) {
    //       warrantyPeriod = "seven";
    //     } else {
    //       warrantyPeriod = "more";
    //     }
    //   }
    // }

    const listing = await saveListingModal.findOne({ listingId: listingId });
    let deviceCondition = listing.deviceCondition;
    let deviceAge = listing.warranty;

    if (deviceAge === "More than 9 months") {
      warrantyPeriod = "zero";
    } else if (deviceAge === "More than 6 months") {
      warrantyPeriod = "four";
    } else if (deviceAge === "More than 3 months") {
      warrantyPeriod = "seven";
    } else if (deviceAge === "None") {
      warrantyPeriod = "more";
    }

    if (deviceCondition === "Like New") {
      cosmeticGrade = "S";
    } else if (deviceCondition === "Excellent") {
      cosmeticGrade = "A";
    } else if (deviceCondition === "Good") {
      cosmeticGrade = "B";
    } else if (deviceCondition === "Fair") {
      cosmeticGrade = "C";
    } else if (deviceCondition === "Needs Repair") {
      cosmeticGrade = "D";
    }

    if (grade === "S" && cosmeticGrade === "S") {
      finalGrade = "S";
    } else if (grade === "S" && cosmeticGrade !== "S") {
      finalGrade = cosmeticGrade;
    } else if (grade !== "S" && cosmeticGrade === "S") {
      finalGrade = grade;
    } else {
      if (grade > cosmeticGrade) {
        finalGrade = grade;
      } else if (grade <= cosmeticGrade) {
        finalGrade = cosmeticGrade;
      }
    }

    if (finalGrade === "S") {
      condition = "Like New";
    } else if (finalGrade === "A") {
      condition = "Excellent";
    } else if (finalGrade === "B") {
      condition = "Good";
    } else if (finalGrade === "C") {
      condition = "Fair";
    }

    // let questionArray = req.body.questionnaireResults;

    // let finalQuestionArray = [];

    // questionArray.forEach((item, index) => {
    //   let childQuestions = item.childQuestions;
    //   if (childQuestions.length > 0) {
    //     let exactChildQuestions = [];
    //     childQuestions.forEach((child) => {
    //       let currentQuestion = getQuestions.find(
    //         (element) => element.questionId === item.questionId
    //       );
    //       let currentChildQuestion = currentQuestion["childQuestions"].find(
    //         (element2) => element2.questionId === child
    //       );
    //       exactChildQuestions.push(currentChildQuestion["question"]);
    //     });
    //     const updatedChildQuestionArray = {
    //       ...questionArray[index],
    //       childQuestions: exactChildQuestions,
    //     };
    //     finalQuestionArray.push(updatedChildQuestionArray);
    //   } else {
    //     finalQuestionArray.push(item);
    //   }
    // });

    const dataToBeUpdate = {
      deviceFunctionalGrade: grade,
      functionalTestResults: req.body.functionalTestResults,
      // questionnaireResults: finalQuestionArray,
      questionnaireResults: [],
      deviceCosmeticGrade: cosmeticGrade,
      deviceFinalGrade: finalGrade,
      deviceUniqueId: deviceUniqueId,
      deviceStorage: req.body.storage,
    };

    if (!listing) {
      res.status(200).json({
        reason: "Listing not found",
        statusCode: 200,
        status: "SUCCESS",
      });
    } else {
      if (saveData === "Y") {
        const updatedListing = await saveListingModal.findByIdAndUpdate(
          listing._id,
          dataToBeUpdate,
          {
            new: true,
          }
        );
      }
    }

    const make = req.body.make;
    const marketingname = req.body.marketingName;
    // const condition = "Good"; //TODO: Need to make create the dynamic condition
    const storage = req.body.storage;
    const hasCharger = listing.charger === "Y" ? true : false;
    const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
    const hasEarphone = listing.earphone === "Y" ? true : false;
    const isAppleEarphoneIncluded = make === "Apple" ? hasEarphone : false;
    const hasOrignalBox = listing.orignalBox === "Y" ? true : false;
    const isVarified = true;

    const price = await getRecommendedPrice(
      make,
      marketingname,
      condition,
      storage,
      ram,
      hasCharger,
      isAppleChargerIncluded,
      hasEarphone,
      isAppleEarphoneIncluded,
      hasOrignalBox,
      isVarified,
      false,
      warrantyPeriod
    );

    const dataObject = {};
    dataObject["minPrice"] = price.leastSellingprice ?? "-";
    dataObject["maxPrice"] = price.maxsellingprice ?? "-";
    dataObject["grade"] = finalGrade;
    dataObject["functionalGrade"] = grade;
    dataObject["cosmaticGrade"] = cosmeticGrade;
    dataObject["condition"] = condition;
    // dataObject["finalQuestionArray"] = finalQuestionArray;

    res.status(200).json({
      reason: "Listing saved successfully",
      statusCode: 201,
      status: "SUCCESS",
      dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/logDiagTransaction", async (req, res) => {
  try {
    const getLogData = await dignosticsLogsModal.find({
      sessionId: req.body.sessionId,
    });

    if (getLogData.length > 0) {
      const updateLogData = await dignosticsLogsModal.updateOne(
        { sessionId: req.body.sessionId },
        {
          $set: {
            ...req.body,
          },
        }
      );
      res.status(200).json({
        message: "Logs updated successfully",
        sessionId: req.body.sessionId.toString(),
        status: "SUCCESS",
        data: updateLogData || {},
      });
    } else {
      const saveLogData = await dignosticsLogsModal.create({
        ...req.body,
      });
      res.status(200).json({
        reason: "Logs saved successfully",
        status: "SUCCESS",
        sessionId: req.body.sessionId.toString(),
        data: saveLogData || {},
      });
    }
    // const dataToBeSave = new dignosticsLogsModal(req.body);
    // const createLog = await dataToBeSave.save();
    // res.status(200).json({
    //   reason: "Diagnostics logs saved successfully",
    //   statusCode: 201,
    //   status: "SUCCESS",
    //   // data: createLog,
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/getDiagLogs", async (req, res) => {
  try {
    const getLogData = await dignosticsLogsModal.find({
      sessionId: req.query.sessionId,
    });

    if (getLogData.length > 0) {
      res.status(200).json({
        reason: "Logs found successfully",
        statusCode: 200,
        status: "SUCCESS",
        data: getLogData,
      });
    } else {
      res.status(200).json({
        reason: "Logs not found",
        statusCode: 200,
        status: "SUCCESS",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
