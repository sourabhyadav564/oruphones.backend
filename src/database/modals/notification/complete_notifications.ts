import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		userUniqueId: {
			type: String,
			required: true,
		},
		notification: {
			type: [
				{
					notificationId: {
						type: String,
						// required: true,
					},
					isUnRead: {
						type: Number,
						// required: true,
						default: 0,
					},
					createdDate: {
						type: String,
						// required: true,
					},
					appEventAction: {
						type: String,
						// required: true,
					},
					webEventAction: {
						type: String,
						// required: true,
					},
					messageContent: {
						type: String,
						// required: true,
					},
				},
			],
		},
	},
	{ timestamps: true }
);

notificationSchema.index({ userUniqueId: 1 });
const notificationModel = mongoose.model(
	'complete_notifications',
	notificationSchema
);

export = notificationModel;
