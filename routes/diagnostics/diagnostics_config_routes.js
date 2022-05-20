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
const connection = require("../../src/database/mysql_connection");
const getRecommendedPrice = require("../../utils/get_recommended_price");
const questionModal = require("../../src/database/modals/master/get_question");

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

router.post("/grade/price", async (req, res) => {
  const companyId = req.body.companyId;
  const diagSessionId = req.body.diagSessionId;
  const functionalTestResults = req.body.functionalTestResults;
  const listingId = req.body.listingId;
  // const make = req.body.make;
  // const marketingName = req.body.marketingName;
  const questionnaireResults = req.body.questionnaireResults;
  const deviceUniqueId = req.body.deviceUniqueId;
  const ram = req.body.ram;
  // const storage = req.body.storage;
  const userUniqueId = req.body.userUniqueId;

  const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
  const deviceFinalGrade = req.body.deviceFinalGrade;
  const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
  // fs.writeFileSync(`${listingId}.json`, JSON.stringify(req.body));
  const saveData = res.body.saveData;

  // PASS
  // OPTIMIZABLE
  // FAIL

  try {
    const severityLow = [
      "RotationVectorSensorTest",
      "BarometerTest",
      "MagneticSensorTest",
      "LinearAccelerationSensorTest",
      "BluetoothToggleTest",
    ];
    const severityMedium = [
      "VibrationTest",
      "BluetoothOffTest",
      "BluetoothOnTest",
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
    // console.log("getQuestions", getQuestions);

    // functionalTestResults.forEach((item, i) => {
    for (item of functionalTestResults) {
      if (severityHigh.includes(item.commandName)) {
        if (item.testStatus !== "PASS") {
          grade = "C";
          condition = "Fair";
          break;
        }
      } else if (severityMedium.includes(item.commandName)) {
        if (item.testStatus !== "PASS") {
          if (count <= 3) {
            grade = "B";
            condition = "Good";
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

    // let cIndex = 0;

    for (item of questionnaireResults) {
      if (item.questionId === 1 && item.childQuestions.length > 0) {
        if (item.childQuestions.length === 3) {
          cosmeticGrade = "C";
          break;
        } else if (item.childQuestions.length === 2) {
          cosmeticGrade = "B";
          break;
        } else if (
          item.childQuestions.includes(3) ||
          item.childQuestions.includes(5)
        ) {
          cosmeticGrade = "B";
          break;
        } else if (item.childQuestions.includes(4)) {
          cosmeticGrade = "A";
          break;
        }
      } else if (item.questionId === 6 && item.childQuestions.length > 0) {
        if (item.childQuestions.length >= 3) {
          cosmeticGrade = "C";
          break;
        } else if (item.childQuestions.length === 2) {
          if (
            item.childQuestions.includes(7) &&
            item.childQuestions.includes(8)
          ) {
            cosmeticGrade = "C";
            break;
          } else if (
            (item.childQuestions.includes(7) &&
              item.childQuestions.includes(9)) ||
            (item.childQuestions.includes(7) &&
              item.childQuestions.includes(10)) ||
            (item.childQuestions.includes(8) &&
              item.childQuestions.includes(9)) ||
            (item.childQuestions.includes(8) &&
              item.childQuestions.includes(10))
          ) {
            cosmeticGrade = "B";
            break;
          } else if (
            item.childQuestions.includes(9) ||
            item.childQuestions.includes(10)
          ) {
            cosmeticGrade = "A";
          }
        } else if (
          item.childQuestions.includes(7) ||
          item.childQuestions.includes(8)
        ) {
          cosmeticGrade = "B";
          break;
        } else if (
          item.childQuestions.includes(9) ||
          item.childQuestions.includes(10)
        ) {
          cosmeticGrade = "A";
          break;
        }
      } else if (item.childQuestions.length === 0) {
        cosmeticGrade = "S";
      }
    }

    // } catch (error) {
    //   console.log(error);
    // }
    // try {

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

    const listing = await saveListingModal.findOne({ listingId: listingId });

    // console.log(listing);

    let questionArray = req.body.questionnaireResults;
    // console.log("questionArray", questionArray);

    let finalQuestionArray = [];

    questionArray.forEach((item, index) => {
      // console.log("childQuestions", item.childQuestions);
      let childQuestions = item.childQuestions;
      if (childQuestions.length > 0) {
        let exactChildQuestions = [];
        childQuestions.forEach((child) => {
          // console.log("getQuestions", getQuestions)
          let currentQuestion = getQuestions.find(
            (element) => element.questionId === item.questionId
          );
          // console.log("current Questions", currentQuestion);
          let currentChildQuestion = currentQuestion["childQuestions"].find(
            (element2) => element2.questionId === child
          );
          // console.log("currentChildQuestion", currentChildQuestion);
          // currentChildQuestion.question;
          // questionArray[index].childQuestions[]
          exactChildQuestions.push(currentChildQuestion["question"]);
          // let anyVar = questionArray[index]["childQuestions"].indexOf(child);
          // questionArray[index]["childQuestions"][anyVar] = currentChildQuestion["question"];
        });
        // questionArray[index].childQuestions = [];
        // questionArray[index]["childQuestions"] = exactChildQuestions;
        const updatedChildQuestionArray = {
          ...questionArray[index],
          childQuestions: exactChildQuestions,
        };
        // let questionObject = {
        //   questionId: item.questionId,
        //   question: item.question,
        //   childQuestions: updatedChildQuestionArray,
        //   result: item.result,
        // };
        finalQuestionArray.push(updatedChildQuestionArray);
      } else {
        finalQuestionArray.push(item);
      }
    });

    console.log("questionArrayyyyyyyyyyyyyy: ", finalQuestionArray);

    const dataToBeUpdate = {
      deviceFunctionalGrade: grade,
      functionalTestResults: req.body.functionalTestResults,
      // questionnaireResults: req.body.questionnaireResults,
      questionnaireResults: finalQuestionArray,
      deviceCosmeticGrade: cosmeticGrade,
      deviceFinalGrade: finalGrade,
      deviceUniqueId: deviceUniqueId,
    };

    console.log("dataToBeUpdate", dataToBeUpdate);

    if (!listing) {
      res.status(200).json({
        reason: "Listing not found",
        statusCode: 200,
        status: "SUCCESS",
      });
    } else {
      if (saveData) {
        const updatedListing = await saveListingModal.findByIdAndUpdate(
          listing._id,
          dataToBeUpdate,
          {
            new: true,
          }
        );
      }
      // if (updatedListing) {
      //   console.log("Hurryyyyyyyyyyyyyyyyyyyyyyyyy");
      // } else {
      //   console.log("Lagee rahoo...................!!");
      // }
    }

    // const listing = await saveListingModal.findByIdAndUpdate(
    //   listingId,
    //   {
    //     deviceFunctionalGrade: grade,
    //     functionalTestResults: req.body.functionalTestResults,
    //     questionnaireResults: req.body.questionnaireResults,
    //     deviceCosmeticGrade: cosmeticGrade,
    //     deviceFinalGrade: finalGrade,
    //   },
    //   {
    //     new: true,
    //   }
    // );

    // let query =
    //   "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 10 day;select * from `web_scraper_model`;";

    // connection.query(query, [2, 1], async (err, results, fields) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     let models = results[1];
    //     let scrappedModels = results[0];
    //     let selectdModels = [];
    //     // let minPrice;
    //     // let maxPrice;
    //     let itemId = "";
    //     // let make = "OnePlus";
    //     // let marketingname = "OnePlus 7";
    //     // let condition = "Excellent";
    //     // let storage = "128";
    const make = req.body.make;
    const marketingname = req.body.marketingName;
    // const condition = "Good"; //TODO: Need to make create the dynamic condition
    // const storage = req.body.storage.split(" ")[0].toString();
    const storage = req.body.storage;
    // const hasCharger = req.body.charger === "Y" ? true : false;
    // const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
    // const hasEarphone = req.body.earPhones === "Y" ? true : false;
    // const isAppleEarphoneIncluded = make === "Apple" ? hasEarphone : false;
    // const hasOrignalBox = req.body.originalBox === "Y" ? true : false;
    // const isVarified = req.body.verified === "no" ? false : true;
    const hasCharger = listing.charger === "Y" ? true : false;
    const isAppleChargerIncluded = make === "Apple" ? hasCharger : false;
    const hasEarphone = listing.earphone === "Y" ? true : false;
    const isAppleEarphoneIncluded = make === "Apple" ? hasEarphone : false;
    const hasOrignalBox = listing.orignalBox === "Y" ? true : false;
    const isVarified = true;

    //     let leastSellingPrice;
    //     let lowerRangeMatrix = 0.7;
    //     let upperRangeMatrix = 0.9;
    //     let isAppleCharger = 0.1;
    //     let isNonAppleCharger = 0.05;
    //     let isAppleEarphone = 0.1;
    //     let isNonAppleEarphone = 0.05;
    //     let isOriginalBox = 0.03;

    //     models.forEach((item, index) => {
    //       if (item.name === marketingname) {
    //         itemId = item.id;
    //         return;
    //       }
    //     });

    //     let gotDataFrom = "";

    //     // scrappedModels.forEach((item, index) => {
    //     for (var item of scrappedModels) {
    //       if (
    //         item.model_id === itemId &&
    //         item.mobiru_condition === condition &&
    //         item.storage === parseInt(storage)
    //       ) {
    //         selectdModels.push(item.price);
    //         gotDataFrom = condition;
    //         break;
    //       }
    //       if (condition === "Good" && gotDataFrom === "") {
    //         if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Excellent"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Excellent";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Like New"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Like New";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Fair"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Fair";
    //           break;
    //         }
    //       } else if (condition === "Excellent" && gotDataFrom === "") {
    //         if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Good"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Good";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Like New"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Like New";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Fair"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Fair";
    //           break;
    //         }
    //       } else if (condition === "Like New" && gotDataFrom === "") {
    //         if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Good"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Good";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Excellent"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Excellent";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Fair"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Fair";
    //           break;
    //         }
    //       } else if (condition === "Fair" && gotDataFrom === "") {
    //         if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Good"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Good";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Excellent"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Excellent";
    //           break;
    //         } else if (
    //           item.model_id === itemId &&
    //           item.storage === parseInt(storage) &&
    //           item.mobiru_condition === "Like New"
    //         ) {
    //           selectdModels.push(item.price);
    //           gotDataFrom = "Like New";
    //           break;
    //         }
    //       }
    //     }

    //     leastSellingPrice = Math.min(...selectdModels);

    //     let bool = false;

    //     if (condition === "Good") {
    //       if (gotDataFrom === "Good") {
    //         bool = true;
    //         // return;
    //       } else if (gotDataFrom === "Excellent") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 1300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 1700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 2500;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 3500;
    //           bool = true;
    //         }
    //       } else if (gotDataFrom === "Like New") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 1500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 2500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 3500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 5500;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 8000;
    //           bool = true;
    //         }
    //       }
    //     } else if (condition === "Excellent") {
    //       if (gotDataFrom === "Excellent") {
    //         console.log("return from Excellent");
    //         bool = true;
    //         // return;
    //       } else if (gotDataFrom === "Good") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice + 300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 1300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 1700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 2500;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice + 3500;
    //           bool = true;
    //         }
    //       } else if (gotDataFrom === "Like New") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 400;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 800;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 1200;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 2300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 3000;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 4500;
    //           bool = true;
    //         }
    //       }
    //     } else if (condition === "Like New") {
    //       if (gotDataFrom === "Like New") {
    //         bool = true;
    //         // return;
    //       } else if (gotDataFrom === "Good") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice + 700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 1500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 2500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 3500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 5500;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice + 8000;
    //           bool = true;
    //         }
    //       } else if (gotDataFrom === "Excellent") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice + 400;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 800;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 1200;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 2300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice + 3000;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice + 4500;
    //           bool = true;
    //         }
    //       }
    //     } else if (condition === "Fair") {
    //       if (gotDataFrom === "Good") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 1500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 2500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 3500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 5500;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 8000;
    //           bool = true;
    //         }
    //       } else if (gotDataFrom === "Excellent") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 1200;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 2300;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 3700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 4700;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 8000;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 11500;
    //           bool = true;
    //         }
    //       } else if (gotDataFrom === "Like New") {
    //         if (leastSellingPrice <= 10000) {
    //           leastSellingPrice = leastSellingPrice - 1500;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 20000 &&
    //           leastSellingPrice > 10000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 3000;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 30000 &&
    //           leastSellingPrice > 20000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 5000;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 50000 &&
    //           leastSellingPrice > 30000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 7000;
    //           bool = true;
    //         } else if (
    //           leastSellingPrice <= 70000 &&
    //           leastSellingPrice > 50000
    //         ) {
    //           leastSellingPrice = leastSellingPrice - 11000;
    //           bool = true;
    //         } else if (leastSellingPrice > 70000) {
    //           leastSellingPrice = leastSellingPrice - 16000;
    //           bool = true;
    //         }
    //       }
    //     }

    //     // if (bool) {
    //     // console.log("leastSellingPrice: " + leastSellingPrice);
    //     // console.log("gotDataFrom: " + gotDataFrom);
    //     // }

    //     // let recommendedPriceRange = `${0.7 * Math.max(...selectdModels)} to ${
    //     //   0.9 * Math.max(...selectdModels)
    //     // }`;

    //     let recommendedPriceRangeLowerLimit = Math.ceil(
    //       lowerRangeMatrix * leastSellingPrice
    //     );
    //     let recommendedPriceRangeUpperLimit = Math.ceil(
    //       upperRangeMatrix * leastSellingPrice
    //     );

    //     if (hasCharger && hasEarphone && hasOrignalBox) {
    //       if (isAppleEarphoneIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix +
    //             isAppleEarphone +
    //             isOriginalBox +
    //             isAppleCharger) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix +
    //             isAppleEarphone +
    //             isOriginalBox +
    //             isAppleCharger) *
    //             leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix +
    //             isNonAppleEarphone +
    //             isOriginalBox +
    //             isNonAppleCharger) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix +
    //             isNonAppleEarphone +
    //             isOriginalBox +
    //             isNonAppleCharger) *
    //             leastSellingPrice
    //         );
    //       }
    //     } else if (hasCharger && hasEarphone) {
    //       if (isAppleChargerIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isAppleCharger + isAppleEarphone) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isAppleCharger + isAppleEarphone) *
    //             leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isNonAppleCharger + isNonAppleEarphone) *
    //             leastSellingPrice
    //         );
    //       }
    //     } else if (hasCharger && hasOrignalBox) {
    //       if (isAppleChargerIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isAppleCharger + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isAppleCharger + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isNonAppleCharger + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isNonAppleCharger + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //       }
    //     } else if (hasEarphone && hasOrignalBox) {
    //       if (isAppleEarphoneIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isAppleEarphone + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isAppleEarphone + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isNonAppleEarphone + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isNonAppleEarphone + isOriginalBox) *
    //             leastSellingPrice
    //         );
    //       }
    //     } else if (hasCharger) {
    //       if (isAppleChargerIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isAppleCharger) * leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isAppleCharger) * leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isNonAppleCharger) * leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isNonAppleCharger) * leastSellingPrice
    //         );
    //       }
    //     } else if (hasEarphone) {
    //       if (isAppleEarphoneIncluded) {
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isAppleEarphone) * leastSellingPrice
    //         );
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isAppleEarphone) * leastSellingPrice
    //         );
    //       } else {
    //         recommendedPriceRangeLowerLimit = Math.ceil(
    //           (lowerRangeMatrix + isNonAppleEarphone) * leastSellingPrice
    //         );
    //         recommendedPriceRangeUpperLimit = Math.ceil(
    //           (upperRangeMatrix + isNonAppleEarphone) * leastSellingPrice
    //         );
    //       }
    //     } else if (hasOrignalBox) {
    //       recommendedPriceRangeUpperLimit = Math.ceil(
    //         (upperRangeMatrix + isOriginalBox) * leastSellingPrice
    //       );
    //       recommendedPriceRangeLowerLimit = Math.ceil(
    //         (lowerRangeMatrix + isOriginalBox) * leastSellingPrice
    //       );
    //     }

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
      false
    );

    const dataObject = {};
    dataObject["minPrice"] = price.leastSellingprice ?? "-";
    dataObject["maxPrice"] = price.maxsellingprice ?? "-";
    dataObject["grade"] = finalGrade;
    dataObject["functionalGrade"] = grade;
    dataObject["cosmaticGrade"] = cosmeticGrade;
    dataObject["condition"] = condition;
    dataObject["yourBody"] = req.body.questionnaireResults;
    dataObject["finalQuestionArray"] = finalQuestionArray;

    // if (selectdModels.length) {
    //   // if (selectdModels.length > 1) {
    //   //   minPrice = Math.min(...selectdModels);
    //   //   maxPrice = Math.max(...selectdModels);
    //   // } else {
    //   //   minPrice = selectdModels[0];
    //   //   maxPrice = selectdModels[0];
    //   // }
    //   res.status(200).json({
    //     reason: "Models Found Successfully",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     // marketingname: marketingname,
    //     // minPrice: minPrice,
    //     // maxPrice: maxPrice,
    //     // recommendedPriceRange: `${recommendedPriceRangeLowerLimit} to ${recommendedPriceRangeUpperLimit}`,
    //     dataObject: dataObject,
    //   });
    // } else {
    //   res.status(200).json({
    //     reason: "Models Found Successfully",
    //     statusCode: 200,
    //     status: "SUCCESS",
    //     // marketingname: marketingname,
    //     // minPrice: "NA",
    //     // maxPrice: "NA",
    //     dataObject: dataObject,
    //   });
    // }

    res.status(200).json({
      reason: "Listing saved successfully",
      statusCode: 201,
      status: "SUCCESS",
      dataObject,
    });
    // }
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
