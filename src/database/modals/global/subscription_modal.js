const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const subscriptionModal = new mongoose.model(
	'subscriptions_emails',
	subscriptionSchema
);

module.exports = subscriptionModal;
