const express = require('express');
const saveListingModal = require('@/database/modals/device/save_listing_device');
const createUserModal = require('@/database/modals/login/login_create_user');
const eventModal = require('@/database/modals/others/event_logs');
const router = express.Router();
const moment = require('moment');
const { sendMailUtil } = require('@/utils/mail_util');
const adminCredModal = require('@/database/modals/login/admin_cred_modal');

const initialTIme = new Date(new Date('2022-08-01T00:00:00.000+00:00'));

router.get('/dashboard/admin/login', async (req, res) => {
	try {
		let user = req.query.user;
		let passwd = req.query.password;

		let admin = await adminCredModal.findOne({
			username: user,
			password: passwd,
		});

		if (admin) {
			res.status(200).json({
				reason: 'Admin logged in',
				statusCode: 200,
				status: 'SUCCESS',
				data: admin,
			});
		} else {
			res.status(401).json({
				reason: 'Wrong credentials',
				statusCode: 401,
				status: 'FAILURE',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});
router.get('/dashboard/home', async (req, res) => {
	try {
		// let user = req.query.user;
		// let passwd = req.query.password;

		let accessKey = req.query.accessKey;

		let admin = await adminCredModal.findOne({
			key: accessKey,
		});

		if (admin) {
			// const initialTIme = new Date(new Date("2022-08-01T00:00:00.000+00:00"));
			let allTimeUsers = {};

			let users = await createUserModal.countDocuments();

			// count of users monthly and also add the year
			let monthlyUsers = await createUserModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: initialTIme,
						},
					},
				},
				{
					$group: {
						_id: {
							// _id will be the year and month like 2021-08
							$dateToString: {
								format: '%Y-%m',
								date: '$createdAt',
							},
						},
						month: {
							$first: {
								$month: '$createdAt',
							},
						},
						year: {
							$first: {
								$year: '$createdAt',
							},
						},
						count: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						year: 1,
						month: 1,
					},
				},
			]);

			let dataObject = {
				allUsers: users,
				monthlyUsers,
			};

			// now find allListings and monthlyListings

			const allListings = await saveListingModal.countDocuments();

			const monthlyListings = await saveListingModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: initialTIme,
						},
					},
				},
				{
					$group: {
						_id: {
							// _id will be the year and month like 2021-08
							$dateToString: {
								format: '%Y-%m',
								date: '$createdAt',
							},
						},
						month: {
							$first: {
								$month: '$createdAt',
							},
						},
						year: {
							$first: {
								$year: '$createdAt',
							},
						},
						count: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						year: 1,
						month: 1,
					},
				},
			]);

			dataObject.allListings = allListings;
			dataObject.monthlyListings = monthlyListings;

			// now find allVerifiedListings and monthlyVerifiedListings

			const allVerifiedListings = await saveListingModal.countDocuments({
				verified: true,
			});

			const monthlyVerifiedListings = await saveListingModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: initialTIme,
						},
						verified: true,
					},
				},
				{
					$group: {
						_id: {
							// _id will be the year and month like 2021-08
							$dateToString: {
								format: '%Y-%m',
								date: '$createdAt',
							},
						},
						month: {
							$first: {
								$month: '$createdAt',
							},
						},
						year: {
							$first: {
								$year: '$createdAt',
							},
						},
						count: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						year: 1,
						month: 1,
					},
				},
			]);

			dataObject.allVerifiedListings = allVerifiedListings;
			dataObject.monthlyVerifiedListings = monthlyVerifiedListings;

			res.status(200).json({
				reason: 'Data found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		} else {
			res.status(200).json({
				reason: 'Wrong credentials',
				statusCode: 401,
				status: 'SUCCESS',
				dataObject: {},
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/dashboard/listingsByCity', async (req, res) => {
	try {
		let accessKey = req.query.accessKey;

		let admin = await adminCredModal.findOne({
			key: accessKey,
		});

		if (admin) {
			let startTime = req.query.startTime
				? new Date(req.query.startTime)
				: initialTIme;
			let endTime = req.query.endTime
				? new Date(req.query.endTime)
				: new Date();

			let allListings = await saveListingModal.countDocuments({
				createdAt: {
					$gte: startTime,
					$lte: endTime,
				},
			});

			let cityWiseListings = await saveListingModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: startTime,
							$lte: endTime,
						},
					},
				},
				{
					$group: {
						_id: '$listingLocation',
						count: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						count: -1,
					},
				},
			]);

			const dataObject = {};
			dataObject.allListings = allListings;
			dataObject.cityWiseListings = cityWiseListings;

			res.status(200).json({
				reason: 'Listings found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		} else {
			res.status(200).json({
				reason: 'Wrong credentials',
				statusCode: 401,
				status: 'SUCCESS',
				dataObject: {},
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/dashboard/users', async (req, res) => {
	try {
		const timeFor = req.query.timeFor;
		// const cityFor = req.query.cityFor;

		const dataObject = [];
		res.status(200).json({
			reason: 'Users found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/dashboard/event', async (req, res) => {
	try {
		let accessKey = req.query.accessKey;

		let admin = await adminCredModal.findOne({
			key: accessKey,
		});

		if (admin) {
			const eventFor = req.query.eventFor;

			const allEvents = await eventModal.aggregate([
				{
					$match: {
						'events.eventName': eventFor,
					},
				},
				{
					$group: {
						_id: {
							// _id will be the year and month like 2021-08
							$dateToString: {
								format: '%Y-%m',
								date: '$createdAt',
							},
						},
						month: {
							$first: {
								$month: '$createdAt',
							},
						},
						year: {
							$first: {
								$year: '$createdAt',
							},
						},
						eventCount: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						year: 1,
						month: 1,
					},
				},
			]);

			// total events for the given eventFor
			const allEventsCount = allEvents.reduce((acc, curr) => {
				return acc + curr.eventCount;
			}, 0);

			const dataObject = {
				allEventsCount,
				allEvents,
			};
			res.status(200).json({
				reason: 'Events found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		} else {
			res.status(200).json({
				reason: 'Wrong credentials',
				statusCode: 401,
				status: 'SUCCESS',
				dataObject: {},
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/dashboard/listingsByAgent', async (req, res) => {
	try {
		let accessKey = req.query.accessKey;

		let admin = await adminCredModal.findOne({
			key: accessKey,
		});

		if (admin) {
			let last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
			let startTime = req.query.startTime
				? new Date(req.query.startTime)
				: last24Hours;
			let endTime = req.query.endTime
				? new Date(req.query.endTime)
				: new Date();

			// // get data from 1 april 00:00:00 to 30 april 23:59:59 for 2023
			// let startTime = new Date("2023-04-01T00:00:00.000+00:00");
			// let endTime = new Date("2023-04-30T23:59:59.000+00:00");

			let agentWiseListings = await saveListingModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: startTime,
							$lte: endTime,
						},
						storeId: '001',
					},
				},
				{
					$group: {
						_id: '$agent',
						Listings: {
							$sum: 1,
						},
						Without_Image: {
							$sum: {
								$cond: [{ $eq: [{ $size: '$images' }, 0] }, 1, 0],
							},
						},
					},
				},
				{
					$sort: {
						Listings: -1,
					},
				},
			]);

			// now find total users for the given time agentwise

			let agentWiseUsers = await createUserModal.aggregate([
				{
					$match: {
						createdAt: {
							$gte: startTime,
							$lte: endTime,
						},
						userType: 'olxUser',
					},
				},
				{
					$group: {
						_id: '$agent',
						count: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						count: -1,
					},
				},
			]);

			// merge both the arrays for agents

			let agentWiseData = await agentWiseListings.map((agent) => {
				let agentWiseUser = agentWiseUsers.find(
					(user) => user._id === agent._id
				);
				return {
					...agent,
					Total_Users: agentWiseUser ? agentWiseUser.count : 0,
				};
			});

			const dataObject = {
				// from and to will be in the format of 30 Aug 2021 00:00:00
				From: moment(startTime).format('DD MMM YYYY HH:mm:ss'),
				To: moment(endTime).format('DD MMM YYYY HH:mm:ss'),
				TotalListings: agentWiseListings.reduce((acc, curr) => {
					return acc + curr.Listings;
				}, 0),
				TotalUsers: agentWiseUsers.reduce((acc, curr) => {
					return acc + curr.count;
				}, 0),
				AgentWiseData: agentWiseData,
			};

			// mail body will be in html format and with appropriate styling

			let mailBody = `
    <h1 style="text-align: center;">Agent Wise Data</h1>
    <h3 style="text-align: center;">From: ${dataObject.From}</h3>
    <h3 style="text-align: center;">To: ${dataObject.To}</h3>
    <h3 style="text-align: center;">Total Listings: ${
			dataObject.TotalListings
		}</h3>
    <h3 style="text-align: center;">Total Users: ${dataObject.TotalUsers}</h3>
    <table style="width: 100%; border: 1px solid black; border-collapse: collapse;">
    <tr style="border: 1px solid black; border-collapse: collapse;">
    <th style="border: 1px solid black; border-collapse: collapse;">Agent</th>
    <th style="border: 1px solid black; border-collapse: collapse;">Total Listings</th>
    <th style="border: 1px solid black; border-collapse: collapse;">Unique Users</th>
    <th style="border: 1px solid black; border-collapse: collapse;">Without Image</th>
    </tr>
    ${dataObject.AgentWiseData.map(
			(agent) => `
    <tr style="border: 1px solid black; border-collapse: collapse;">
    <td style="border: 1px solid black; border-collapse: collapse; text-align: center;">${agent._id
			?.toString()
			.toUpperCase()}</td>
    <td style="border: 1px solid black; border-collapse: collapse; text-align: center;">${
			agent.Listings
		}</td>
    <td style="border: 1px solid black; border-collapse: collapse; text-align: center;">${
			agent.Total_Users
		}</td>
    <td style="border: 1px solid black; border-collapse: collapse; text-align: center;">${
			agent.Without_Image
		}</td>
    </tr>
    `
		).join('')}
    </table>

    <br />
    <h4 style="text-align: left;">Team ORUphones</h4>
    `;

			sendMailUtil('Daily Listings by Agents', mailBody);

			res.status(200).json({
				reason: 'Daily by agent found',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject,
			});
		} else {
			res.status(200).json({
				reason: 'Wrong credentials',
				statusCode: 401,
				status: 'SUCCESS',
				dataObject: {},
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
