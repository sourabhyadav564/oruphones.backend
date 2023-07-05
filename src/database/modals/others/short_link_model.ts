import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
	{
		unKey: {
			type: String,
			// required: true,
		},
		linkStr: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

linkSchema.index({ unKey: 1 }, { unique: true });
const shortLinkModal = mongoose.model('short_links', linkSchema);
export = shortLinkModal;
