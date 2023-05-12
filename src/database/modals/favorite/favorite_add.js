const mongoose = require('mongoose');
const validator = require('validator');

const favoriteSchema = new mongoose.Schema(
	{
		userUniqueId: {
			type: String,
			required: true,
		},
		fav_listings: {
			type: [
				{
					type: 'String',
					required: true,
				},
			],
			required: true,
		},
	},
	{ timestamps: true }
);

favoriteSchema.index({ userUniqueId: 1 });
const favoriteModal = new mongoose.model('favorite_lists', favoriteSchema);

module.exports = favoriteModal;
