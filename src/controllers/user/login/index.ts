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
				req.session.User = user;
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