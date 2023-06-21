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
	otp: 1,
});
const userModal = mongoose.model('user_datas', userSchema);
export = userModal;
