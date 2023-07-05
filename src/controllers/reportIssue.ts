import Reports from '@/database/modals/others/report_log';
import { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'rtrmntzuzwzisajb',
	},
});

const validator = z.object({
	hasLog: z.boolean().optional().default(false),
	issueType: z.string().default('Crash'),
	description: z.string().default('No Description'),
	email: z.string().email().default('No Email'),
	phone: z.string().default('No Phone'),
	name: z.string().default('No Name'),
	modelName: z.string().default('No Model Name'),
	forCrash: z.boolean().optional().default(false),
	shareLog: z.boolean().optional().default(false),
	scheduleCall: z.boolean().default(false),
});

const devMails = 'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp';
const prodMails =
	'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, piyush@zenro.co.jp, anish@zenro.co.jp, shubham@oruphones.com';

export default async function reportIssue(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const {
			hasLog,
			issueType,
			description,
			email,
			phone,
			name,
			modelName,
			forCrash,
			shareLog,
			scheduleCall,
		} = validator.parse(req.body);
		await Reports.create({
			...req.body,
			src: req.useragent?.platform,
			hasLog: req.file ? true : false,
		});
		if (scheduleCall || (hasLog && req.file)) {
			const mailBody = `<H1>Hi Team,</H1>
      <p>There is a new query from ${name} with email ${email} and phone ${phone}.</p>
      <p>Source: ${req.useragent?.platform}</p>
      <H3>Issue Type: ${issueType}</H3>
      <p>Description: ${description}</p>
      <p>Model Name: ${modelName}</p>
      <a>Log File: ${req.file?.path}</a>
      <p>Thanks</p>
      <p>Team ORUphones</p>
      `;
			const mailOptions = {
				from: 'mobiruindia22@gmail.com',
				to:
					process.env.SERVER_URL === 'https://oruphones.com'
						? prodMails
						: devMails,
				subject: scheduleCall
					? `Call Schedule from ${name}`
					: `New Query from ${name}`,
				html: mailBody,
			};
			config.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				}
			});
		}
		res.status(200).json({
			message: 'Reported Successfully',
		});
	} catch (error) {
		next(error);
	}
}
