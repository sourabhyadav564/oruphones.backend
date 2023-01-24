const dotenv = require("dotenv");
dotenv.config();

const moment = require("moment");
const bcrypt = require("bcryptjs");
const makeRandomString = require("../utils/generate_random_string");
const generateHash = require("../utils/generate_hash");

// const FCM = require("fcm-node");
const fetch = require("node-fetch");
const saveNotificationModel = require("../src/database/modals/notification/notification_save_token");
const notificationModel = require("../src/database/modals/notification/complete_notifications");
const sendverificationSMS = require("./send_verification_sms");
const sendLoginOtp = require("./send_login_otp");
const sendingSms = require("./sms_assign");

const sendNotification = async (
  sellerUniqueId,
  isVerification,
  marketingName,
  sellerName,
  sellerContactNumber,
  clientOTP
  ) => {

  const now = new Date();
  const currentDate = moment(now).format("L");

  const string = await makeRandomString(25);
  // const hashCode = await generateHash(string);

  let tokenObject = await saveNotificationModel.find({
    userUniqueId: sellerUniqueId,
  });

  let notificationTokens = [];
  tokenObject.forEach((item, index) => {
    notificationTokens.push(item.tokenId);
  });

  //Push notification to user devices (if exists)
  var notification_body = {
    registration_ids: notificationTokens,
    notification: {
      title: isVerification
        ? `Hey ${sellerName}, You've got a verification request`
        : `Hey ${sellerName}, A listing has been removed from your favourite list`,
      body: isVerification
        ? `Click here to visit your listings and complete verification for your ${marketingName}.`
        : `Click here to visit your favourites and contact seller before they sold out!!`,
      sound: "default",
      //   click_action: "FCM_PLUGIN_ACTIVITY",
      icon: "fcm_push_icon",
    },
    data: {
      title: isVerification
        ? `Hey ${sellerName}, Someone wants to buy your ${marketingName}.`
        : `Hey ${sellerName}, A listing has been removed from your favourite list`,
      body: {
        source: "ORU Phones",
        messageContent: isVerification
          ? `Click here to visit your listings and complete verification for your ${marketingName}.`
          : `Click here to visit your favourites and contact seller before they sold out!!`,
      },
      appEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
      webEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
    },
  };

  fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      // replace authorization key with your key
      Authorization: "key=" + process.env.FCM_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification_body),
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });

  //Save notification to database
  let notificationData = {
    appEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
    webEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
    messageContent: isVerification
      ? `Click here to visit your listings and complete verification for your ${marketingName}.`
      : `Click here to visit your favourites and contact seller before they sold out!!`,
    notificationId: string,
    createdDate: currentDate,
  };

  let dataToBeSave = {
    userUniqueId: sellerUniqueId,
    notification: [notificationData],
  };

  const notificationObject = await notificationModel.findOne({
    userUniqueId: sellerUniqueId,
  });
  if (!notificationObject) {
    const saveNotification = new notificationModel(dataToBeSave);
    let dataObject = await saveNotification.save();
  } else {
    const updateNotification = await notificationModel.findByIdAndUpdate(
      notificationObject._id,
      { $push: { notification: notificationData } },
      { new: true }
    );
  }

  const sendMessage = await sendingSms("verify", sellerContactNumber, sellerUniqueId, sellerName, marketingName);
};

module.exports = sendNotification;
