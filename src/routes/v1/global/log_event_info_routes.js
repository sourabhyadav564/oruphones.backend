const express = require('express');
const router = express.Router();

const logEvent = require('@/middleware/event_logging');
const saveListingModal = require('@/database/modals/device/save_listing_device');
const favoriteModal = require('@/database/modals/favorite/favorite_add');
const eventModal = require('@/database/modals/others/event_logs');
const createUserModal = require('@/database/modals/login/login_create_user');
const validUser = require('@/middleware/valid_user');
const { uploadLogFile } = require('@/s3');
const reportModal = require('@/database/modals/others/report_log');
const gradeModal = require('@/database/modals/others/report_grade');
const fs = require('fs');
const moment = require('moment');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const { sendMailUtil } = require('@/utils/mail_util');
const config = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'mobiruindia22@gmail.com',
		pass: 'rtrmntzuzwzisajb',
	},
});

router.get('/logeventinfo', validUser, logEvent, async (req, res) => {
	try {
		res.status(200).send({
			status: 'SUCCESS',
			statusCode: 200,
			reason: 'Event logged successfully',
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

const storage = multer.diskStorage({
	destination: function (req, file, next) {
		next(null, __dirname);
	},
	filename: function (req, file, next) {
		next(null, Date.now().toString() + '-' + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 10 },
	// fileFilter: fileFilter,
});

router.get('/reportIssue/:key', (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

const devMails = 'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp';
const prodMails =
	'nishant.sharma@zenro.co.jp, sourabh@zenro.co.jp, piyush@zenro.co.jp, anish@zenro.co.jp, shubham@oruphones.com';

router.post('/reportIssue', upload.single('logFile'), async (req, res) => {
	try {
		const file = req.file || null;
		const src = req.headers.deviceplatform || 'No source';
		const hasLog = req.query.hasLog == 'true' ? true : false;
		const issueType = req.query.issueType || 'Crash';
		const description = req.query.description || 'No description';
		const email = req.query.email || 'No email';
		const phone = req.query.phone || 'No phone';
		const name = req.query.name || 'No name';
		const modelName = req.query.modelName || 'No model name';
		const forCrash = req.query.forCrash == 'true' ? true : false;
		const shareLog = req.query.shareLog == 'true' ? true : false;
		const scheduleCall = req.query.scheduleCall == 'true' ? true : false;
		// const scheduledTime = req.query.scheduledTime || Date.now();

		let dataObject = {};

		// sendMailUtil("report Issue header", req.headers.deviceplatform);

		if (hasLog && file) {
			// get currentTime as 14_26_58
			let currentTime = new Date().toLocaleTimeString().replace(/:/g, '_');
			let fName = modelName.replace(/\s/g, '_') + '_' + currentTime + '.txt';
			const result = await uploadLogFile(file, fName, forCrash, false);
			await unlinkFile(file?.path);
			dataObject = {
				filePath: `${result.Location}`,
				fileKey: `${result.Key}`,
			};
		}

		dataObject = {
			...dataObject,
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
			src,
		};

		// save query in database
		const newQuery = new reportModal(dataObject);
		await newQuery.save();

		// Send email to support team with the file path
		if ((hasLog && file) || scheduleCall) {
			let mailBody = `<H1>Hi Team,</H1>
      <p>There is a new query from ${name} with email ${email} and phone ${phone}.</p>
      <p>Source: ${src}</p>
      <H3>Issue Type: ${issueType}</H3>
      <p>Description: ${description}</p>
      <p>Model Name: ${modelName}</p>
      <a>Log File: ${dataObject.filePath}</a>
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
			reason: 'Query logged successfully',
			statusCode: 201,
			status: 'SUCCESS',
			dataObject,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/uploadReport/:key', (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

router.post('/uploadReport', upload.single('reportFile'), async (req, res) => {
	try {
		const file = req.file || null;
		const src = (await req.headers.deviceplatform) || 'No source';
		const reportId = req.query.reportId || 'ORU-12345678';
		const userUniqueId = req.query.userUniqueId || 'Guest';
		const modelName = req.query.modelName || 'No model name';

		let dataObject = {};

		if (file) {
			let currentTime = new Date().toLocaleTimeString().replace(/:/g, '_');
			let fName = modelName.replace(/\s/g, '_') + '_' + currentTime + '.pdf';
			const result = await uploadLogFile(file, fName, false, true);
			await unlinkFile(file?.path);
			dataObject = {
				filePath: `${result.Location}`,
				fileKey: `${result.Key}`,
				src,
				reportId,
				userUniqueId,
			};

			// save query in database
			const newQuery = new gradeModal(dataObject);
			await newQuery.save();

			res.status(200).json({
				reason: 'Report saved into your account',
				statusCode: 201,
				status: 'SUCCESS',
				dataObject,
			});
		} else {
			res.status(400).json({
				reason: 'No file found',
				statusCode: 400,
				status: 'FAILED',
				dataObject,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get('/checkReport', upload.single('reportFile'), async (req, res) => {
	try {
		let reportId = req.query.reportId;
		let userUniqueId = req.query.userUniqueId;
		let getMine = req.query.getMine || false;

		switch (getMine) {
			case 'true':
				getMine = true;
				break;
			case true:
				getMine = true;
				break;
			case 'false':
				getMine = false;
				break;
			case false:
				getMine = false;
				break;
			default:
				getMine = false;
				break;
		}

		if (getMine) {
			// createdAt will be in Mar 23 2023 format using moment
			const reports = await gradeModal.aggregate([
				{
					$match: {
						userUniqueId: userUniqueId,
					},
				},
				{
					$project: {
						reportId: 1,
						createdAt: moment({ $add: ['$createdAt', 19800000] }).format(
							'MMM Do YYYY'
						),
						src: 1,
						filePath: 1,
					},
				},
			]);

			if (reports) {
				res.status(200).json({
					reason: 'Report found',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject: {
						reports: reports,
					},
				});
			} else {
				res.status(200).json({
					reason: 'No report found',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject: {
						reports: [],
					},
				});
			}
		} else {
			const report = await gradeModal.findOne({
				reportId: reportId,
			});

			if (report) {
				res.status(200).json({
					reason: 'Report found',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject: {
						reportLink: report.filePath,
					},
				});
			} else {
				res.status(200).json({
					reason: 'No report found',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject: {
						reportLink: 'No report found',
					},
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(200).json({
			reason: 'No report found',
			statusCode: 200,
			status: 'SUCCESS',
			dataObject: {
				reportLink: 'No report found',
			},
		});
	}
});

router.get('/logs/geteventinfo', async (req, res) => {
	let location = req.query.location;
	try {
		if (location?.toString()?.toLowerCase()?.includes(',')) {
			location = location.split(',')[0].trim();
		}
		const currentDate = new Date();
		const total_logs_captured = await eventModal.countDocuments({
			createdAt: currentDate,
		});

		const total_logs_captured_geographically = await eventModal.countDocuments({
			location: location,
		});

		const total_unique_users = await eventModal
			.distinct('userUniqueId')
			.countDocuments();

		const total_app_opens = await eventModal.countDocuments({
			events: {
				$elemMatch: {
					$or: [
						{ eventName: 'SESSION_CREATED' },
						{ eventName: 'FETCH_USER_DETAILS' },
					],
				},
			},
			srcFrom: 'App',
		});

		const total_unique_users_with_app_opens = await eventModal
			.distinct('userUniqueId', {})
			.countDocuments({
				events: { $elemMatch: { eventName: 'SESSION_CREATED' } },
				srcFrom: 'App',
			});

		let total_new_listing_attempted = await eventModal.find({});
		let home_sell_now_count = 0;
		total_new_listing_attempted = total_new_listing_attempted.forEach(
			(item) => {
				item.events.filter((event) => {
					if (event.eventName === 'HOME_SELLNOW_SELECTED') {
						home_sell_now_count++;
					}
				});
			}
		);

		total_new_listing_attempted = home_sell_now_count;

		let total_new_listing_completed = await eventModal.find({});
		let new_listing_completed_count = 0;
		total_new_listing_completed = total_new_listing_completed.forEach(
			(item) => {
				item.events.filter((event) => {
					if (event.eventName === 'ADDLISTING_ADD_SUCCESS') {
						new_listing_completed_count++;
					}
				});
			}
		);

		total_new_listing_completed = new_listing_completed_count;

		let total_new_listing_completed_without_photos = await eventModal.find({});
		let new_listing_completed_without_photos_count = 0;
		let photos_uploaded = 0;
		let listings_added = 0;
		total_new_listing_completed_without_photos =
			total_new_listing_completed_without_photos.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'ADDLISTING_ADD_SUCCESS') {
						// console.log("event", event);
						listings_added = listings_added + 1;
						new_listing_completed_without_photos_count++;
					} else if (event.eventName === 'ADDLISTING_UPLOAD_PHOTOS_SUCCESS') {
						photos_uploaded = photos_uploaded + 1;
					}
				});
			});

		new_listing_completed_without_photos_count =
			listings_added - photos_uploaded;

		total_new_listing_completed_without_photos =
			new_listing_completed_without_photos_count;

		let total_listings_verification_attempted = await eventModal.find({});
		let total_listings_verification_attempted_count = 0;

		total_listings_verification_attempted =
			total_listings_verification_attempted.forEach((item) => {
				item.events.filter((event) => {
					if (
						event.eventName === 'ADDLISTING_VERIFY_NOW' ||
						event.eventName === 'LISTINGINFO_VERIFY_SELECTED' ||
						event.eventName === 'MYLISTINGS_VERIFYNOW_SELECTED' ||
						event.eventName === 'MYLISTINGS_VERIFYNOW_HELP_SELECTED'
					) {
						total_listings_verification_attempted_count++;
					}
				});
			});

		total_listings_verification_attempted =
			total_listings_verification_attempted_count;

		let total_number_of_listing_activated = await eventModal.find({});
		let total_number_of_listing_activated_count = 0;
		total_number_of_listing_activated =
			total_number_of_listing_activated.forEach((item) => {
				item.events.filter((event) => {
					if (
						event.eventName === 'MYLISTINGS_VERIFYNOW_HELP_SELECTED' ||
						event.eventName === 'LISTINGINFO_ACTIVATENOW_SELECTED' ||
						event.eventName === 'LISTINGINFO_ACTIVATENOW_SUCCESS'
					) {
						total_number_of_listing_activated_count++;
					}
				});
			});
		total_number_of_listing_activated = total_number_of_listing_activated_count;

		let total_number_of_listing_deleted = await eventModal.find({});
		let total_number_of_listing_deleted_count = 0;
		total_number_of_listing_deleted = total_number_of_listing_deleted.forEach(
			(item) => {
				item.events.filter((event) => {
					if (
						event.eventName === 'MYLISTINGS_DELETE_SELECTED' ||
						event.eventName === 'LISTINGINFO_DELETE_SELECTED' ||
						event.eventName === 'LISTINGINFO_DELETE_SUCCESS'
					) {
						total_number_of_listing_deleted_count++;
					}
				});
			}
		);

		total_number_of_listing_deleted = total_number_of_listing_deleted_count;

		let total_number_of_contact_seller_attempted = await eventModal.find({});
		let total_number_of_contact_seller_attempted_count = 0;
		total_number_of_contact_seller_attempted =
			total_number_of_contact_seller_attempted.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'LISTINGINFO_CONTACT_SELLER') {
						total_number_of_contact_seller_attempted_count++;
					}
				});
			});

		total_number_of_contact_seller_attempted =
			total_number_of_contact_seller_attempted_count;

		let total_number_of_request_verification_attempted = await eventModal.find(
			{}
		);

		let total_number_of_request_verification_attempted_count = 0;
		total_number_of_request_verification_attempted =
			total_number_of_request_verification_attempted.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'LISTINGINFO_REQUEST_VERIFICATION') {
						total_number_of_request_verification_attempted_count++;
					}
				});
			});

		total_number_of_request_verification_attempted =
			total_number_of_request_verification_attempted_count;

		let total_listings_verified_from_web = await eventModal.find({
			srcFrom: 'Web',
		});
		let total_listings_verified_from_web_count = 0;
		total_listings_verified_from_web = total_listings_verified_from_web.forEach(
			(item) => {
				item.events.filter((event) => {
					if (
						event.eventName === 'ADDLISTING_VERIFY_NOW' ||
						event.eventName === 'LISTINGINFO_VERIFY_SELECTED' ||
						event.eventName === 'MYLISTINGS_VERIFYNOW_SELECTED' ||
						event.eventName === 'MYLISTINGS_VERIFYNOW_HELP_SELECTED'
					) {
						total_listings_verified_from_web_count++;
					}
				});
			}
		);

		total_listings_verified_from_web = total_listings_verified_from_web_count;

		let total_number_of_visits_at_service_tab = await eventModal.find({});
		let total_number_of_visits_at_service_tab_count = 0;
		total_number_of_visits_at_service_tab =
			total_number_of_visits_at_service_tab.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'HOME_SERVICES_SELECTED') {
						total_number_of_visits_at_service_tab_count++;
					}
				});
			});
		total_number_of_visits_at_service_tab =
			total_number_of_visits_at_service_tab_count;

		let total_number_of_visits_at_buyers_verification = await eventModal.find(
			{}
		);
		let total_number_of_visits_at_buyers_verification_count = 0;
		total_number_of_visits_at_buyers_verification =
			total_number_of_visits_at_buyers_verification.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'BUYER_VERIFICATION_LINK_CLICKED') {
						total_number_of_visits_at_buyers_verification_count++;
					}
				});
			});

		total_number_of_visits_at_buyers_verification =
			total_number_of_visits_at_buyers_verification_count;

		let total_number_of_buyers_verification_completed = await eventModal.find(
			{}
		);
		let total_number_of_buyers_verification_completed_count = 0;
		total_number_of_buyers_verification_completed =
			total_number_of_buyers_verification_completed.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'BUYER_VERIFICATION_COMPLETED') {
						total_number_of_buyers_verification_completed_count++;
					}
				});
			});

		total_number_of_buyers_verification_completed =
			total_number_of_buyers_verification_completed_count;

		let total_listings_verification_completed = await eventModal.find({});
		let total_listings_verification_completed_count = 0;
		total_listings_verification_completed =
			total_listings_verification_completed.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'TEST_RESULT_SELL_PRICE_CHANGED') {
						total_listings_verification_completed_count++;
					}
				});
			});

		total_listings_verification_completed =
			total_listings_verification_completed_count;

		let total_diagnostics_session_invocked = await eventModal.find({});

		let total_diagnostics_session_invocked_count = 0;
		total_diagnostics_session_invocked =
			total_diagnostics_session_invocked.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'DIAGNOSTICS_SESSION_INVOKED') {
						total_diagnostics_session_invocked_count++;
					}
				});
			});

		total_diagnostics_session_invocked =
			total_diagnostics_session_invocked_count;

		let total_diagnostics_session_completed = await eventModal.find({});

		let total_diagnostics_session_completed_count = 0;

		total_diagnostics_session_completed =
			total_diagnostics_session_completed.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'DIAGNOSTICS_SESSION_COMPLETED') {
						total_diagnostics_session_completed_count++;
					}
				});
			});

		total_diagnostics_session_completed =
			total_diagnostics_session_completed_count;

		let total_data_transfer_session_invocked = await eventModal.find({});

		let total_data_transfer_session_invocked_count = 0;
		total_data_transfer_session_invocked =
			total_data_transfer_session_invocked.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'DATA_TRANSFER_SESSION_INVOKED') {
						total_data_transfer_session_invocked_count++;
					}
				});
			});

		total_data_transfer_session_invocked =
			total_data_transfer_session_invocked_count;

		let total_data_transfer_session_completed = await eventModal.find({});

		let total_data_transfer_session_completed_count = 0;

		total_data_transfer_session_completed =
			total_data_transfer_session_completed.forEach((item) => {
				item.events.filter((event) => {
					if (event.eventName === 'DATA_TRANSFER_SESSION_COMPLETED') {
						total_data_transfer_session_completed_count++;
					}
				});
			});

		total_data_transfer_session_completed =
			total_data_transfer_session_completed_count;

		const total_listings = await saveListingModal.find({});
		let listing_with_recommended_price = [];
		total_listings.forEach(async (listing) => {
			if (
				listing?.recommendedPriceRange != NaN &&
				listing?.recommendedPriceRange != undefined
			) {
				if (
					listing?.recommendedPriceRange.toString().length > 0 &&
					listing?.recommendedPriceRange.toString() != '- - -' &&
					listing?.recommendedPriceRange.toString() != '---'
				) {
					listingPrice = listing?.listingPrice;
					minPrice = parseInt(
						listing?.recommendedPriceRange.split('-')[0].trim()
					);
					maxPrice = parseInt(
						listing?.recommendedPriceRange.split('-')[1].trim()
					);

					if (listingPrice >= minPrice && listingPrice <= maxPrice) {
						listing_with_recommended_price.push(listing?.listingId);
					}
				}
			}
			total_listing_with_price_within_recommended_price =
				listing_with_recommended_price.length;
		});

		const total_listings_older_then_90_days =
			await saveListingModal.countDocuments({
				createdAt: {
					$lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
				},
			});

		const favrouit_listings = await favoriteModal.find({
			fav_listings: { $ne: [] },
		});

		let fav_listing_details = [];

		favrouit_listings.forEach(async (listing) => {
			listing.fav_listings.forEach(async (fav_listing) => {
				const listing_data = await saveListingModal.findOne({
					listingId: fav_listing,
				});
				if (listing_data) {
					fav_listing_details.push(listing_data.marketingName);
					const fav_most_repeated_model_name = fav_listing_details.reduce(
						(acc, curr) => {
							acc[curr] = (acc[curr] || 0) + 1;
							return acc;
						}
					);
					const fav_most_repeated_model_name_key = Object.keys(
						fav_most_repeated_model_name
					)[0];
					const _fav_most_repeated_model_name_value =
						fav_most_repeated_model_name[fav_most_repeated_model_name_key];
				}
			});
		});

		const listing_with_name_other_then_guest = await saveListingModal.find({
			userName: { $ne: 'Guest' },
		});

		let listing_with_real_name = [];

		listing_with_name_other_then_guest.forEach(async (listing) => {
			listing_with_real_name.push(listing.listedBy);
		});

		const listing_with_real_name_unique = listing_with_real_name.filter(
			(item, index, array) => array.indexOf(item) === index
		);

		const total_users_registered_today = await createUserModal.countDocuments({
			createdAt: {
				$gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
			},
		});

		const sessions = await eventModal.find({});
		let session_duration_in_seconds = [];
		sessions.forEach(async (session) => {
			const session_duration =
				(session.updatedAt.getTime() - session.createdAt.getTime()) / 1000;
			session_duration_in_seconds.push(session_duration);
		});
		// const session_duration_in_seconds_sum = session_duration_in_seconds.reduce(
		//   (acc, curr) => acc + curr
		// );
		// const session_duration_in_seconds_avg =
		//   session_duration_in_seconds_sum / session_duration_in_seconds.length;

		// const total_sessions = await eventModal.countDocuments({});
		// const total_sessions_duration =
		//   session_duration_in_seconds_sum / total_sessions;

		// const total_sessions_duration_avg =
		//   session_duration_in_seconds_avg / total_sessions;

		let complete_marketing_name = [];
		const total_marketing_name_from_listing = await saveListingModal.find({
			marketingName: { $ne: '' },
		});

		total_marketing_name_from_listing.forEach(async (listing) => {
			complete_marketing_name.push(listing.marketingName);
		});

		const complete_marketing_name_unique = complete_marketing_name.filter(
			(item, index, array) => array.indexOf(item) === index
		);

		const total_user_device_platform = await eventModal.find({});
		let user_device_platform = [];
		total_user_device_platform.forEach(async (user) => {
			user_device_platform.push(user);
		});

		let user_device_platform_android = [];
		let user_device_platform_ios = [];
		user_device_platform.forEach(async (user) => {
			if (user.devicePlatform === 'Android') {
				user_device_platform_android.push(user?.devicePlatform);
			}
			if (user.devicePlatform === 'iOS') {
				user_device_platform_ios.push(user?.devicePlatform);
			}
		});

		res.json({
			total_logs_captured,
			total_logs_captured_geographically,
			total_unique_users,
			total_app_opens,
			total_unique_users_with_app_opens,
			total_new_listing_attempted,
			total_new_listing_completed,
			total_new_listing_completed_without_photos,
			total_listings_verification_attempted,
			total_number_of_listing_activated,
			total_number_of_listing_deleted,
			total_number_of_contact_seller_attempted,
			total_number_of_request_verification_attempted,
			total_listings_verified_from_web,
			total_number_of_visits_at_service_tab,
			total_number_of_visits_at_buyers_verification,
			total_number_of_buyers_verification_completed,
			total_listings_verification_completed,
			total_diagnostics_session_invocked,
			total_diagnostics_session_completed,
			total_data_transfer_session_invocked,
			total_data_transfer_session_completed,
			total_listing_with_price_within_recommended_price,
			total_listings_older_then_90_days,
			fav_listing_details,
			listing_with_real_name,
			total_users_registered_today,
			listing_with_real_name_unique,
			complete_marketing_name_unique,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
