const { FSx } = require("aws-sdk");
const testing_scrapped_data_dump = require("../src/database/modals/others/migration_model");
const scrappedLogModal = require("../src/database/modals/others/scrapped_log_models");
const testScrappedModal = require("../src/database/modals/others/test_scrapped_models");
const fs = require("fs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "rtrmntzuzwzisajb",
  },
});

const startDataMigration = async () => {
  const d = new Date();
  let date = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();

  date = date < 10 ? "0" + date : date;
  month = month < 10 ? "0" + month : month;

  // console.log("date1", date, month, year);
  // console.log("date ", new Date(`${year}-${month}-${date}T00:00:00.837Z`));
  // let allListings = fs.readFileSync(`consolidatedDataBS.json`, "utf8");
  // allListings = await JSON.parse(allListings);
  // console.log("allListings", allListings.length);
  let allListings = await testing_scrapped_data_dump.find({
    $and: [
      {
        created_at: {
          $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        },
      },
      {
        price: {
          $gte: 1000,
        },
      },
    ],
  });
  // console.log("listingsLength", allListings.length);

  const ourConditions = [
    "Like New",
    "Good",
    "Excellent",
    "Fair",
    "New - Seal Pack",
  ];

  // now for each listing, we need to check if it exists in the testScrappedModal and update its values
  for (let i = 0; i < allListings.length; i++) {
    const listing = allListings[i]["_doc"];
    // const listing = allListings[i];
    // if (
    //   (listing.type == "buy" || listing.type == "Buy") &&
    //   listing.make != "Apple" &&
    //   (listing.storage == "--" ||
    //     listing.ram == "--" ||
    //     listing.ram == null ||
    //     listing.storage == null ||
    //     listing.price > 2500) &&
    //   !ourConditions.includes(listing.mobiru_condition) &&
    //   !listing.link.toString().includes("://")
    // ) {
    //   // console.log("into 2nd if");
    //   // continue;
    //   // break;
    // } else if (
    //   (listing.type == "buy" || listing.type == "Buy") &&
    //   listing.make == "Apple" &&
    //   (listing.storage == "--" ||
    //     listing.ram == null ||
    //     listing.storage == null ||
    //     listing.price > 2500) &&
    //   !ourConditions.includes(listing.mobiru_condition) &&
    //   !listing.link.toString().includes("://")
    // ) {
    //   // console.log("into 3rd if");
    //   // continue;
    //   // break;
    // } else
    if (
      listing.type == "sell" ||
      listing.type == "Sell" ||
      ((listing.type == "buy" || listing.type == "Buy") &&
        !(
          listing.make != "Apple" &&
          (listing.ram == "--" ||
            listing.storage == "--" ||
            listing.ram == null ||
            listing.storage == null)
        ) &&
        ourConditions.includes(listing.mobiru_condition) &&
        listing.price > 2500 &&
        listing.link.toString().includes("://"))
    ) {
      let findingData = {};

      // console.log("into the only if");
      if (listing["make"] != "Apple") {
        findingData = {
          make: listing["make"],
          model_name: listing["model_name"],
          storage: listing["storage"],
          ram: listing["ram"],
          mobiru_condition: listing["mobiru_condition"],
          type: listing["type"],
          vendor_id: listing["vendor_id"],
        };
      } else {
        findingData = {
          make: listing["make"],
          model_name: listing["model_name"],
          storage: listing["storage"],
          mobiru_condition: listing["mobiru_condition"],
          type: listing["type"],
          vendor_id: listing["vendor_id"],
        };
      }

      // console.log("findingData", findingData);

      const listingExists = await testScrappedModal.findOne(findingData);

      if (listingExists) {
        // console.log("listingExists", listingExists["model_name"]);
        // update the listing
        await testScrappedModal.updateOne(
          {
            model_name: listingExists["model_name"],
            make: listingExists["make"],
            storage: listingExists["storage"],
            ram: listingExists["ram"],
            mobiru_condition: listingExists["mobiru_condition"],
            type: listingExists["type"],
            vendor_id: listingExists["vendor_id"],
          },
          {
            $set: {
              price: listing["price"],
              actualPrice: listing["actualPrice"],
              ram:
                listingExists["make"] != "Apple" ? listingExists["ram"] : "--",
              link: listing["link"],
              warranty: listing["warranty"],
              // created_at: listing["created_at"],
            },
          }
        );
      } else {
        // console.log("listing not exists");
        // create new object by listing
        let brand = listing["make"]
          ? listing["make"]
          : listing["model_name"].toString().split(" ")[0];
        const newListing = {
          make: brand,
          model_name: listing["model_name"],
          storage: listing["storage"],
          ram: brand != "Apple" ? listing["ram"] : "--",
          mobiru_condition: listing["mobiru_condition"],
          type: listing["type"],
          vendor_id: listing["vendor_id"],
          price: listing["price"],
          actualPrice: listing["actualPrice"],
          link: listing["link"],
          warranty: listing["warranty"],
          // created_at: listing["created_at"]
          //   ? listing["created_at"]
          //   : new Date(),
        };

        // console.log("newListing", newListing);

        // create the listing
        await testScrappedModal.create(newListing);
      }
    }
    if (i == allListings.length - 1) {
      if (process.env.Collection == "oru_phones_production_database") {
        sendLogMail("Sell");
      }
      // console.log("migration done");
    }
  }
};

const sendLogMail = async (type) => {
  // const d = new Date();
  // let date = d.getDate();

  const d = new Date();
  let date = d.getDate() - 1;
  let month = d.getMonth() + 1;
  let year = d.getFullYear();

  date = date < 10 ? "0" + date : date;
  date = date == "00" ? "01" : date;
  month = month < 10 ? "0" + month : month;

  let todayLogs = await scrappedLogModal.find({
    $and: [
      {
        end_time: {
          $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        },
      },
      {
        type: type,
      },
    ],
  });

  let totalMigrated = {};
  if (type == "Buy") {
    let totalBuyListings = await testScrappedModal.countDocuments({
      type: ["buy", "Buy"],
      updatedAt: {
        $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        // $gte: new Date(`2022-11-29T22:00:00.837Z`),
      },
    });
    let totalSellListings = await testScrappedModal.countDocuments({
      type: ["sell", "Sell"],
      updatedAt: {
        $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        // $gte: new Date(`2022-11-29T22:00:00.837Z`),
      },
    });

    let newListings = await testScrappedModal.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        // $gte: new Date(`2022-11-29T22:00:00.837Z`),
      },
    });

    let totalListings = await testScrappedModal.countDocuments({
      updatedAt: {
        $gte: new Date(`${year}-${month}-${date}T00:00:00.837Z`),
        // $gte: new Date(`2022-11-29T22:00:00.837Z`),
      },
    });

    totalMigrated = {
      totalBuyListings: totalBuyListings,
      totalSellListings: totalSellListings,
      newListings: newListings,
      totalListings: totalListings,
      updatedListings: totalListings - newListings,
    };
  }

  // get only latest objects if there are multiple objects for same vendor in todayLogs
  let latestLogs = [];
  for (let i = 0; i < todayLogs.length; i++) {
    const log = todayLogs[i];
    const { vendor_id } = log;
    const logExists = latestLogs.find((l) => l.vendor_id == vendor_id);
    if (!logExists) {
      latestLogs.push(log);
    } else {
      if (log.end_time > logExists.end_time) {
        latestLogs = latestLogs.filter((l) => l.vendor_id != vendor_id);
        latestLogs.push(log);
      }
    }
  }

  // get all vendors from latestLogs
  const VENDORS = {
    6: "Amazon",
    7: "Quikr",
    8: "Cashify",
    9: "2Gud",
    10: "Budli",
    11: "Paytm",
    12: "Yaantra",
    13: "Sahivalue",
    14: "Shopcluse",
    15: "Xtracover",
    16: "Mobigarage",
    17: "Instacash",
    18: "Cashforphone",
    19: "Recycledevice",
    20: "Quickmobile",
    21: "Buyblynk",
    22: "Electronicbazaar",
    23: "Flipkart",
    26: "OLX",
  };
  let allVendors = [];
  let totalScrappedModels = 0;
  let totalScrappedRecords = 0;
  let totalSkippedModels = 0;
  let allLogs = {};

  for (let i = 0; i < latestLogs.length; i++) {
    const log = latestLogs[i];
    const {
      vendor_id,
      total_scrapped_models,
      total_scrapped_records,
      total_skipped_models,
    } = log;
    allVendors.push(VENDORS[vendor_id]);
    totalScrappedModels += total_scrapped_models;
    totalScrappedRecords += total_scrapped_records;
    totalSkippedModels += total_skipped_models;
    allLogs[VENDORS[vendor_id]] = log;
  }

  //  create the mail body
  let mailBody = `<h3>Scrapped Logs for ${type} CronJob</h3>`;
  mailBody += `<p>Total Vendors Scrapped: ${allVendors.length}</p>`;
  // mailBody += `<p>Total Vendors: ${Object.keys(VENDORS).length}</p>`;
  mailBody += `<p>Vendors Scrapped: ${allVendors.join(", ")}</p>`;
  mailBody += `<p>Total Scrapped Models: ${totalScrappedModels}</p>`;
  mailBody += `<p>Total Scrapped Records: ${totalScrappedRecords}</p>`;
  mailBody += `<p>Total Skipped Models: ${totalSkippedModels}</p>`;
  mailBody += `<p>Logs: </p>`;
  mailBody += `<table style="border: 1px solid black; border-collapse: collapse; width: 100%;">
  <tr>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Vendor</th>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Scrapped Models</th>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Scrapped Records</th>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Skipped Models</th>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">Start Time</th>
    <th style="border: 1px solid black; border-collapse: collapse; padding: 5px;">End Time</th>
  </tr>`;
  for (let i = 0; i < latestLogs.length; i++) {
    const log = latestLogs[i];
    const {
      vendor_id,
      total_scrapped_models,
      total_scrapped_records,
      total_skipped_models,
      start_time,
      end_time,
    } = log;
    mailBody += `<tr>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${VENDORS[vendor_id]}</td>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${total_scrapped_models}</td>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${total_scrapped_records}</td>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${total_skipped_models}</td>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${start_time}</td>
    <td style="border: 1px solid black; border-collapse: collapse; padding: 5px;">${end_time}</td>
  </tr>`;
  }
  mailBody += `</table>`;

  mailBody += `<br><br><br><h2>Migration Logs for CronJob</h2>`;
  mailBody += `<p>Today\'s Buy Listings: ${totalMigrated.totalBuyListings}</p>`;
  mailBody += `<p>Today\'s Sell Listings: ${totalMigrated.totalSellListings}</p>`;
  mailBody += `<p>Total Listings: ${totalMigrated.totalListings}</p>`;
  mailBody += `<p>New Listings: ${totalMigrated.newListings}</p>`;
  mailBody += `<p>Updated Listings: ${totalMigrated.updatedListings}</p>`;
  // mailBody += `<p>Skipped Listings: ${totalMigrated.skippedListings}</p>`;
  mailBody += `<br><br><br>`;

  // add allLogs to mailBody
  // mailBody += `<p>Logs: ${JSON.stringify(allLogs)}</p>`;

  // send mail
  let mailOptions2 = {
    from: "mobiruindia22@gmail.com",
    to: "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, ashish.khandelwal@zenro.co.jp, anish@zenro.co.jp",
    subject: `Scrapped Logs for ${type}`,
    html: mailBody,
  };

  config.sendMail(mailOptions2, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      // console.log("Email sent: " + info.response);
    }
  });

  if (type == "Sell") {
    sendLogMail("Buy");
  } else {
    // startDataMigration();
  }
};

const startDataMigrationJob = async () => {
  // sendLogMail("Sell");
  startDataMigration();
  // sendLogMail("Buy");
};

module.exports = startDataMigrationJob;
