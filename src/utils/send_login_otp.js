require('dotenv').config();
const { SNS } = require('@aws-sdk/client-sns');

const sendLoginOtp = (number, message) => {
	var params = {
		Message: `${message} is your login OTP for your registration process. Please enter the OTP to Proceed. Team ORUphones`,
		Subject: 'ORU Phones',
		PhoneNumber: '91' + number,
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

module.exports = sendLoginOtp;
