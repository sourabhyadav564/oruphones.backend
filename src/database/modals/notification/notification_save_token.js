const mongoose = require('mongoose');

const saveNotificationSchema = new mongoose.Schema(
	{
		deviceId: {
			type: String,
			required: true,
		},
		tokenId: {
			type: String,
			required: true,
		},
		userUniqueId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const saveNotificationModel = new mongoose.model(
	'save_notification_tokens',
	saveNotificationSchema
);

module.exports = saveNotificationModel;
