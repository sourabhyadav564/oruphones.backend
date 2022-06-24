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

const sendNotification = async (
  sellerUniqueId,
  isVerification,
  marketingName,
  sellerName
) => {
  const now = new Date();
  const currentDate = moment(now).format("L");

  const string = await makeRandomString(25);
  // const hashCode = await generateHash(string);
  // console.log("hashCode", hashCode);

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
        ? `Hey ${sellerName}, You've got a verfication request`
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
        ? `Hey ${sellerName}, You've got a verfication request`
        : `Hey ${sellerName}, A listing has been removed from your favourite list`,
      body: {
        source: "ORU Phones",
        messageContent: isVerification
          ? `Click here to visit your listings and complete verification for your ${marketingName}.`
          : `Click here to visit your favourites and contact seller before they sold out!!`,
      },
      appEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
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

  //   let fcm = new FCM(process.env.FCM_KEY);
  //   let message = {
  // to: notificationTokens[2],
  //     notification: {
  //       title: "Want to sell your phone at best deal??",
  //       body: "Download the ORU Phones app today and get the best market price of your phone with our complete verification.",
  //       sound: "default",
  //       click_action: "FCM_PLUGIN_ACTIVITY",
  //       icon: "fcm_push_icon",
  //     },
  //     data: {
  //       title: "ok tested!",
  //       body: {
  //         source: "ORU Phones",
  //         messageContent:
  //           "Download the ORU Phones app today and get the best market price of your phone with our complete verification.",
  //       },
  //       appEventAction: isVerification ? "MY_LISTINGS" : "MY_FAVORITES",
  //     },
  //   };
  //   fcm.send(message, function (err, response) {
  //     if (err) {
  //       console.log("Something has gone wrong!");
  //     } else {
  //       console.log("Successfully sent with response: ", response);
  //       return response;
  //     }
  //   });
};

const sendNotificationToAll = async (sendNotificationToUser, updateListing) => {
  const now = new Date();
        const currentDate = moment(now).format("L");

        const string = await makeRandomString(25);

        let tokenObject = await saveNotificationModel.find({
          userUniqueId: sendNotificationToUser,
        });

        // console.log("tokenObject", tokenObject);

        let notificationTokens = [];
        tokenObject.forEach((item, index) => {
          notificationTokens.push(item.tokenId);
        });

        var notification_body = {
          registration_ids: notificationTokens,
          notification: {
            title: `Congratulations!!!`,
            body: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
            sound: "default",
            //   click_action: "FCM_PLUGIN_ACTIVITY",
            icon: "fcm_push_icon",
          },
          data: {
            title: `Congratulations!!!`,
            body: {
              source: "ORU Phones",
              messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
            },
            appEventAction: "MY_FAVORITES",
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
          appEventAction: "MY_FAVORITES",
          messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
          notificationId: string,
          createdDate: currentDate,
        };

        console.log("sendNotificationToUser", sendNotificationToUser);

        sendNotificationToUser.forEach(async (user, index) => {
          let dataToBeSave = {
            userUniqueId: user,
            notification: [notificationData],
          };
  
          const notificationObject = await notificationModel.findOne({
            userUniqueId: user,
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
        })
}

module.exports = sendNotification;
