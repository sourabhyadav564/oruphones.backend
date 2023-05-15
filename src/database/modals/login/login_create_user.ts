import { TUser } from '@/types/User';
import mongoose from 'mongoose';

const createUserSchema = new mongoose.Schema<TUser>(
	{
		userUniqueId: {
			type: String,
			// required: true,
		},
		userName: {
			type: String,
			// required: true,
			default: '',
		},
		userType: {
			type: String,
			// required: true,
			default: '',
		},
		email: {
			type: String,
			default: '',
		},
		password: {
			type: String,
			default: '',
		},
		isaccountexpired: {
			type: Boolean,
			default: false,
		},
		profilePicPath: {
			type: String,
			default: '',
		},
		mobileNumber: {
			type: String,
			required: true,
			unique: true,
		},
		countryCode: {
			type: String,
			required: true,
		},
		address: {
			type: [
				{
					addressType: {
						type: String,
					},
					city: {
						type: String,
						default: '',
					},
					locationId: {
						type: String,
					},
				},
			],
			default: [],
		},
		city: {
			type: String,
			default: '',
		},
		state: {
			type: String,
			default: '',
		},
		createdDate: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
);

createUserSchema.pre('save', function (next) {
	this.userUniqueId = this._id.toString();
	next();
});

const createUserModal = mongoose.model('created_user', createUserSchema);

export default createUserModal;
module.exports = createUserModal;
