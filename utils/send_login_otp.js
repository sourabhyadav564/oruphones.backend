var unirest = require("unirest");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
require("dotenv").config();

var AWS = require("aws-sdk");

// const creds = new AWS.SharedIniFileCredentials({ profile: 'default' });
// const sns = new AWS.SNS({creds, region: 'us-east-1'});

AWS.config.update({
  region: process.env.AWS_SNS_REGION,
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SNS_SECRET_KEY,
});

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

const sendLoginOtp = (number, message) => {
  console.log("message", message);
  console.log("number", number);
  // console.log("Message = " + req.query.message);
  // console.log("Number = " + req.query.number);
  // console.log("Subject = " + req.query.subject);
  var params = {
    Message: `${message} is your login OTP for your registration process. Please enter the OTP to Proceed. Team ORU Phones`,
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

module.exports = sendLoginOtp;
