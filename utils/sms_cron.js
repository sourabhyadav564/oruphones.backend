const express = require("express");
const saveListingModal = require("../src/database/modals/device/save_listing_device");
const createUserModal = require("../src/database/modals/login/login_create_user");
// const SendSMSByTxtLocal = require("./send_sms_textlcl");
const sendingSms = require("./sms_assign");

const nodemailer = require("nodemailer");
const config = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiruindia22@gmail.com",
    pass: "rtrmntzuzwzisajb",
  },
});

let dataToMail = [];
let foundUsers = [];

const SendingSmsDaily = async () => {
  try {
    const users = await createUserModal.find({
      userType: "olxUser",
      createdAt: {
        // get last 1 days data
        $gte: new Date(Date.now() - 1 * 18 * 60 * 60 * 1000),
      },
      // mobileNumber: ["9660398594", "9649493568", "6375197371"]
    });
    if (users.length > 0) {
      foundUsers = users;
      users.forEach(async (user, i) => {
        // console.log(user);

        if (i == users.length - 1) {
          getListings(user.userUniqueId, true);
        } else {
          await getListings(user.userUniqueId, false);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getListings = async (userUniqueId, isLast) => {
  try {
    const listing = await saveListingModal.findOne({
      userUniqueId: userUniqueId,
      verified: false,
    });
    if (listing) {
      dataToMail.push(listing);
      sendingSms(
        "daily",
        listing.mobileNumber,
        listing.userUniqueId,
        listing.listedBy,
        listing.marketingName
      );
    }

    if (isLast) {
      // add delay for 5 seconds
      setTimeout(() => {
        // send mail
        sendLogMail();
      }, 15000);
    }
  } catch (error) {}
};

const SendingSmsWeekly = async () => {
  // For all users who have unverified listings
  try {
    const listings = await saveListingModal.find({
      verified: false,
    });
    if (listings.length > 0) {
      let users = [];
      listings.forEach(async (listing, i) => {
        let user = {
          userUniqueId: listing.userUniqueId,
          mobileNumber: listing.mobileNumber,
        };
        if (!users.includes(user)) {
          users.push(user);
        }

        if (i == listings.length - 1) {
          users.forEach(async (user) => {
            sendingSms("weekly", user.mobileNumber, user.userUniqueId);
          });
        }
      });
    }
  } catch (error) {}
};

const sendLogMail = async () => {
  // convert dataToMail to csv
  let csvData = "Marketing Name, Listed By, Mobile Number, Is Business, City"; // User Unique Id,
  dataToMail.forEach((listing) => {
    let isBusiness = foundUsers.find(
      (user) => user.userUniqueId == listing.userUniqueId
    ).isBusiness;
    csvData += `
    ${listing.marketingName}, ${listing.listedBy}, ${listing.mobileNumber}, ${isBusiness}, ${listing.listingLocation}
    `;
  }); // ${listing.userUniqueId},

  // create the mail body
  let mailBody = "";
  // dataToMail.forEach((listing) => {
  //   mailBody += `
  //   <tr>
  //     <td>${listing.marketingName}</td>
  //     <td>${listing.listedBy}</td>
  //     <td>${listing.mobileNumber}</td>
  //     <td>${listing.userUniqueId}</td>
  //   </tr>
  //   `;
  // });

  // attach csv file

  let mailOptions2 = {
    from: "mobiruindia22@gmail.com",
    to: "nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, ashish.khandelwal@zenro.co.jp, anish@zenro.co.jp",
    subject: `Sent SMS to ${dataToMail.length} OLX users`,
    html: mailBody,
    attachments: [
      {
        filename: "data.csv",
        content: csvData,
        contentType: "text/csv",
      },
    ],
  };

  config.sendMail(mailOptions2, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      // console.log("Email sent: " + info.response);
    }
  });

  dataToMail = [];
};

const SendingSmsJob = async (daily) => {
  if (daily) {
    SendingSmsDaily();
  } else {
    SendingSmsWeekly();
  }
};

module.exports = SendingSmsJob;
