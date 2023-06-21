const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const SendSMSByTxtLocal = require('./send_sms_textlcl');
// const app = express();
require('dotenv').config();

// var AWS = require("aws-sdk");

// const creds = new AWS.SharedIniFileCredentials({ profile: 'default' });
// const sns = new AWS.SNS({creds, region: 'us-east-1'});

// AWS.config.update({
//   region: process.env.AWS_SNS_REGION,
//   accessKeyId: process.env.AWS_SNS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SNS_SECRET_KEY,
// });

const sendLoginOtp = (number, message) => {
	let msg = `${message} is the OTP for your login. Please enter the OTP to proceed. Team ORUphones`;
	SendSMSByTxtLocal(number, msg);
	// var params = {
	//   Message: `${message} is your login OTP for your registration process. Please enter the OTP to Proceed. Team ORUphones`,
	//   Subject: "ORU Phones",
	//   PhoneNumber: "91" + number,
	//   MessageAttributes: {
	//     "AWS.SNS.SMS.SenderID": {
	//       DataType: "String",
	//       StringValue: `${message}`,
	//     },
	//   },
	// };

	// var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
	//   .publish(params)
	//   .promise();

	// publishTextPromise
	//   .then(function (data) {
	//     // res.end(JSON.stringify({ MessageID: data.MessageId }));
	//     console.log(
	//       "MessageID: " + JSON.stringify({ MessageID: data.MessageId })
	//     );
	//   })
	//   .catch(function (err) {
	//     // res.end(JSON.stringify({ Error: err }));
	//     console.log("Error: " + JSON.stringify({ Error: err }));
	//   });
};

module.exports = sendLoginOtp;