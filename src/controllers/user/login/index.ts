import { Request, Response } from 'express';
import { z } from 'zod';
import userModel from '@/database/modals/login/login_create_user';
import { TUser } from '@/types/User';

const loginValidator = z.object({
	username: z.string(),
	password: z.string(),
});

export default async function login(req: Request, res: Response) {
	try {
		const { username, password } = loginValidator.parse(req.body);
		// login logic
		let user = await userModel.findOne({ username: username });
		if (user) {
			if (user.password == password) {
				//set session
				req.session.user = user;
				res.status(200).json({ message: 'Login Successful' });
			} else {
				res.status(400).json({ message: 'Invalid Credentials' });
			}
		} else {
			res.status(400).json({ message: 'Invalid Credentials' });
		}
	} catch (error) {
		res.status(400).json({ error });
	}
}

export function sessionTester(req: Request, res: Response) {
	// set a dummy user session
	const dummyUser: TUser = {
		userUniqueId: '123',
		userName: 'dummy',
		userType: 'dummy',
		email: 'dummy',
		password: 'dummy',
		isaccountexpired: false,
		profilePicPath: 'dummy',
		mobileNumber: 'dummy',
		countryCode: 'dummy',
		address: [
			{
				addressType: 'dummy',
				city: 'dummy',
				locationId: 'dummy',
			},
		],
		city: 'dummy',
		state: 'dummy',
		createdDate: new Date().toISOString(),
	};
	req.session.user = dummyUser;
	res.status(200).json({ message: 'Session Set' });
}
