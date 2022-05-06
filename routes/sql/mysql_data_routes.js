const express = require("express");
const router = express.Router();
const connection = require("../../src/database/mysql_connection");

router.get("/any", async (req, res) => {

    // let query1 = "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 24 hour;"

    // let query2 = "select * from `web_scraper_model`"

    const vendors = {
      6: "Amazon",
      7: "Quikr",
      8: "Cashify",
      9: "2Gud",
      10: "Budli",
      11: "Paytm",
      12: "Yaantra",
      13: "Shopcluse",
      14: "Sahivalue",
      15: "Xtracover",
      16: "Mobigarage",
      17: "Instacash",
      18: "Cashforphone",
      19: "Recycledevice",
      20: "Quickmobile",
      21: "Buyblynk",
      22: "Electronicbazaar"
    }

    let query = "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 72 hour;select * from `web_scraper_model`;"

  try {
    // connection.query(query1, (err, scrappedModels, fields) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         // console.log(scrappedModels);
    //         res.status(200).json({
    //             reason: "Scrapped Models Found Successfully",
    //             statusCode: 200,
    //             status: "SUCCESS",
    //             scrappedModels
    //           });    
    //     }
    // })

    // connection.query(query2, (err, Models, fields) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         // console.log(Models);
    //         res.status(200).json({
    //             reason: "Models Found Successfully",
    //             statusCode: 200,
    //             status: "SUCCESS",
    //             Models
    //           });    
    //     }
    // })

        connection.query(query, [2, 1], (err, results, fields) => {
        if (err) {
            console.log(err);
        } else {
            let models = results[1];
            let scrappedModels = results[0];
            let itemId = ""
            let selectdModels = []
            let minPrice;
            let maxPrice;
            let marketingname = "OnePlus 8";
            let condition = "Excellent"
            models.forEach((item, index) => {
              if(item.name === marketingname) {
                itemId = item.id;
                return;
              }
            })
            scrappedModels.forEach((item, index) => {
              if(item.model_id === itemId && item.mobiru_condition === condition) {
                console.log("item.price", item)
                selectdModels.push(item.price);
                return;
              }
            })

            let recommendedPriceRange = `${0.7*Math.max(...selectdModels)} to ${0.9*Math.max(...selectdModels)}`;
            console.log("recommendedPriceRange", recommendedPriceRange);
            
            if(selectdModels.length) {
              if(selectdModels.length > 1) {
                minPrice = Math.min(...selectdModels);
                maxPrice = Math.max(...selectdModels);
              } else {
                minPrice = selectdModels[0];
                maxPrice = selectdModels[0];
              }
              res.status(200).json({
                  reason: "Models Found Successfully",
                  statusCode: 200,
                  status: "SUCCESS",
                  marketingname: marketingname,
                  minPrice: minPrice,
                  maxPrice: maxPrice,
                  recommendedPriceRange: recommendedPriceRange
                });   
            } else {
              res.status(200).json({
                reason: "Models Found Successfully",
                statusCode: 200,
                status: "SUCCESS",
                marketingname: marketingname,
                minPrice: "NA",
                maxPrice: "NA"
              });
            }

          }
        })

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/new", async (req, res) => {

  // let query1 = "select * from `web_scraper_modelwisescraping` where created_at > now() - interval 24 hour;"

  // let query2 = "select * from `web_scraper_model`;"

  let query = "Select * From `web_scraper_modelwisescraping` Where web_scraper_modelwisescraping.model_id = 1013;"

try {
  // connection.query(query1, (err, scrappedModels, fields) => {
  //     if (err) {
  //         console.log(err);
  //     } else {
  //         // console.log(scrappedModels);
  //         res.status(200).json({
  //             reason: "Scrapped Models Found Successfully",
  //             statusCode: 200,
  //             status: "SUCCESS",
  //             scrappedModels
  //           });    
  //     }
  // })

  // connection.query(query2, (err, Models, fields) => {
  //     if (err) {
  //         console.log(err);
  //     } else {
  //         // console.log(Models);
  //         res.status(200).json({
  //             reason: "Models Found Successfully",
  //             statusCode: 200,
  //             status: "SUCCESS",
  //             Models
  //           });    
  //     }
  // })

      connection.query(query, (err, results, fields) => {
      if (err) {
          console.log(err);
      } else {
          let models = results[1];
          let scrappedModels = results[0];
          let itemId = ""
          let selectdModels = []
          let minPrice;
          let maxPrice;
          let marketingname = "Samsung Galaxy F52 5G";
          models.forEach((item, index) => {
            if(item.name === marketingname) {
              itemId = item.id;
              return;
            }
          })
          console.log(results);
          scrappedModels.forEach((item, index) => {
            if(item.model_id === itemId) {
              selectdModels.push(item.price);
              return;
            }
          })

          if(selectdModels.length) {
            if(selectdModels.length > 1) {
              minPrice = Math.min(...selectdModels);
              maxPrice = Math.max(...selectdModels);
            } else {
              minPrice = selectdModels[0];
              maxPrice = selectdModels[0];
            }
            res.status(200).json({
                reason: "Models Found Successfully",
                statusCode: 200,
                status: "SUCCESS",
                minPrice: minPrice,
                maxPrice: maxPrice
              });   
          } else {
            res.status(200).json({
              reason: "Models Found Successfully",
              statusCode: 200,
              status: "SUCCESS",
              scrappedModels: results[0]
            });
          }

        }
      })

} catch (error) {
  console.log(error);
  res.status(500).json(error);
}
});

module.exports = router;
