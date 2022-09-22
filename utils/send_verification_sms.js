var unirest = require("unirest");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
require("dotenv").config();

var AWS = require("aws-sdk");
const generateOTP = require("./generate_otp");

// const creds = new AWS.SharedIniFileCredentials({ profile: 'default' });
// const sns = new AWS.SNS({creds, region: 'us-east-1'});

AWS.config.update({
  region: process.env.AWS_SNS_REGION,
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SNS_SECRET_KEY,
});

const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient('b798af6695d4e81885f3fd925aa2e152c16123ea');

async function urlShortner(url) {
  const response = await bitly.shorten(url);
  // console.log(`Your shortened bitlink is ${response.link}`);
  return response.link;
}

// const sendLoginOtp = (mobileNumber, clientOTP) => {
//     var req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

//     req.headers({
//       "authorization": process.env.SMS_API_SECRET,
//     });

//     req.form({
//       "variables_values": clientOTP,
//       "route": "otp",
//       "numbers": mobileNumber.toString(),
//     });

//     req.end(function (res) {
//       if (res.error) throw new Error(res.error);
//       console.log(res.body);
//     });
// }

const sendverificationSMS = async (number, message, sellerName, marketingName) => {
  let link_text = "ORUphones";
  let result = link_text.link("https://store.oruphones.com/");

  let shortLink = await urlShortner("https://store.oruphones.com/");
  
  var params = {
    Message: `Hey ${sellerName}, You've got a verification request for your ${marketingName}. Visit ORUphones to complete verification. Please use OTP: ${message} to login. Here's the link: ${shortLink} for verification.`,
    Subject: "ORU Phones",
    PhoneNumber: "+91" + number,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: `${message}`,
      },
    },
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  publishTextPromise
    .then(function (data) {
      // res.end(JSON.stringify({ MessageID: data.MessageId }));
      console.log(
        "MessageID: " + JSON.stringify({ MessageID: data.MessageId })
      );
    })
    .catch(function (err) {
      // res.end(JSON.stringify({ Error: err }));
      console.log("Error: " + JSON.stringify({ Error: err }));
    });
};

module.exports = sendverificationSMS;
