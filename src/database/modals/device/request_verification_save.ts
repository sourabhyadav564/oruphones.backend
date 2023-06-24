import mongoose from 'mongoose';

const saveRequestSchema = new mongoose.Schema(
	{
		userUniqueId: {
			type: String,
			required: true,
		},
		listingId: {
			type: String,
			required: true,
		},
		mobileNumber: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

saveRequestSchema.index({ userUniqueId: 1, listingId: 1 }, { unique: true });
const saveRequestModal = mongoose.model(
	'requested_listings',
	saveRequestSchema
);

export = saveRequestModal;
