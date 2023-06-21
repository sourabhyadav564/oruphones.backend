import validator, { withOTP } from '@/controllers/user/login/_validator';
import createUserModal from '@/database/modals/login/login_create_user';
import userModal from '@/database/modals/login/login_otp_modal';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

function generateOtp() {
	return Math.floor(1000 + Math.random() * 9000);
}

async function otpCreate(req: Request, res: Response, next: NextFunction) {
	try {
		const { countryCode, mobileNumber } = validator.parse(req.body);
		const otpEntry = new userModal({
			mobileNumber,
			countryCode,
			otp: generateOtp(),
		});
		// save entry to db
		await otpEntry.save();
		res.status(200).json({
			reason: 'OTP generated successfully',
			status: 'SUCCESS',
			dataObject: {
				maxTime: 120,
				submitCountIncrement: 0,
				maxRetryCount: '3',
				mobileNumber: `${countryCode}${mobileNumber}`,
			},
		});
	} catch (err) {
		next(err);
	}
}

async function otpValidate(req: Request, res: Response, next: NextFunction) {
	try {
		const { countryCode, mobileNumber, otp } = withOTP.parse(req.body);
		const otpEntry = await userModal.findOne({
			mobileNumber,
			otp,
		});
		if (!otpEntry || otpEntry === undefined || otpEntry === null) {
			return res.status(401).json({
				reason: 'You have entered an invalid OTP',
			});
		}
		await otpEntry.deleteOne();
		// validation successful
		let user = await createUserModal.findOne({
			mobileNumber,
		});
		// if no such user exists, create one
		if (!user || user === undefined || user === null) {
			user = new createUserModal({
				mobileNumber,
				countryCode,
				createdDate: moment(new Date()).format('L'),
			});
			user.save();
		}
		// set session user
		req.session.user = {
			userUniqueId: user.userUniqueId!,
		};
		res.status(200).json({
			reason: 'OTP validated',
			status: 'SUCCESS',
			dataObject: {
				submitCountIncrement: 0,
				maxRetryCount: '3',
				mobileNumber: mobileNumber,
				userUniqueId: user.userUniqueId,
				sessionID: req.sessionID,
			},
		});
	} catch (err) {
		next(err);
	}
}

export default {
  otpCreate,
  otpValidate
}
