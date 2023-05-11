const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
require('dotenv').config();

var { SNS } = require('@aws-sdk/client-sns');

const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient('b798af6695d4e81885f3fd925aa2e152c16123ea');

async function urlShortner(url) {
	const response = await bitly.shorten(url);
	// console.log(`Your shortened bitlink is ${response.link}`);
	return response.link;
}

const sendverificationSMS = async (
	number,
	message,
	sellerName,
	marketingName
) => {
	let link_text = 'ORUphones';
	let result = link_text.link(process.env.SERVER_URL);

	let shortLink = await urlShortner(process.env.SERVER_URL);

	var params = {
		Message: `Hey ${sellerName}, You've got a verification request for your ${marketingName}. Visit ORUphones to complete verification. Please use OTP: ${message} to login. Here's the link: ${shortLink} for verification.`,
		Subject: 'ORU Phones',
		PhoneNumber: '+91' + number,
		MessageAttributes: {
			'AWS.SNS.SMS.SenderID': {
				DataType: 'String',
				StringValue: `${message}`,
			},
		},
	};

	var publishTextPromise = new SNS({ apiVersion: '2010-03-31' })
		.publish(params)
		.promise();

	publishTextPromise
		.then(function (data) {
			// res.end(JSON.stringify({ MessageID: data.MessageId }));
			console.log(
				'MessageID: ' + JSON.stringify({ MessageID: data.MessageId })
			);
		})
		.catch(function (err) {
			// res.end(JSON.stringify({ Error: err }));
			console.log('Error: ' + JSON.stringify({ Error: err }));
		});
};

module.exports = sendverificationSMS;
