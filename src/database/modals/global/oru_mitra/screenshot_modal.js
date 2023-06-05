const mongoose = require('mongoose');

const olxSSSchema = new mongoose.Schema(
	{
		userUniqueId: {
			type: String,
			required: true,
		},
		image: {
			type: {
				thumbnailImagePath: {
					type: String,
				},
				imagePath: {
					type: String,
				},
				isVarified: {
					type: String,
					default: 'new',
				},
			},
		},
		model: {
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

const olxSSModal = new mongoose.model('a_screenshot_datas', olxSSSchema);

module.exports = olxSSModal;
