import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		countryCode: {
			type: Number || String,
			// required: true,
		},
		mobileNumber: {
			type: Number || String,
			required: true,
		},
		otp: {
			type: Number || String,
			required: true,
		},
	},
	{ timestamps: true }
);

userSchema.index({
	mobileNumber: 1,
	countryCode: 1,
});
userSchema.index(
	{
		createdAt: 1,
	},
	{
		expireAfterSeconds: 300, // 5 minutes
	}
);
const userModal = mongoose.model('user_datas', userSchema);
export = userModal;
