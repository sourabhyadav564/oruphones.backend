const express = require("express");
const searchFilterModal = require("../../src/database/modals/global/search_filter_modal");
const router = express.Router();

router.post("/search", async (req, res) => {
  const userInputText = req.body.userInputText;
  try {
    const resultData = await searchFilterModal.find({});
    let brandList = [];
    let results = [];
    let resultType = "";
    let marketingNameAndMakeMap = {};
    let dataObject = {};

    // we canntot use result data for direct accessing its objects.
    // Instead, we should have to use its resultData[0]. Inshort Index.

    if (resultData.length > 0) {
      resultData[0].make.filter((element, index) => {
        if (
          element.toLowerCase().includes(userInputText.toString().toLowerCase())
        ) {
          if (brandList.length < 5) {
            brandList.push(element);
          }
        }
      });
      resultData[0].models.filter((element, index) => {
        if (
          element.toLowerCase().includes(userInputText.toString().toLowerCase())
        ) {
          if (results.length < 15) {
            results.push(element);
          }
          if (brandList.length <= 1) {
            if (!brandList.includes(element.split(" ")[0])) {
              brandList.push(element.split(" ")[0]);
            }
          }
        }
      });

      if (brandList.length === 5) {
        resultType = "make";
      } else {
        resultType = "model";
      }

      results.forEach((element, index) => {
        marketingNameAndMakeMap[element] = element.split(" ")[0];
      });

      dataObject.brandList = brandList;
      dataObject.results = results;
      dataObject.resultType = resultType;
      dataObject.marketingNameAndMakeMap = marketingNameAndMakeMap;
      res.status(200).json({
        reason: "Search suggestions fetched successfully",
        statusCode: 200,
        status: "SUCCESS",
        dataObject,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
