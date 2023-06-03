const express = require('express');
const router = express.Router();
const moment = require('moment');

const saveListingModal = require('../../../database/modals/device/save_listing_device');
const createUserModal = require('../../../database/modals/login/login_create_user');
// const connection = require("../../../database/mysql_connection");

const logEvent = require('../../../middleware/log_event');
const getDefaultImage = require('../../../utils/get_default_image');
const saveRequestModal = require('../../../database/modals/device/request_verification_save');

const sendNotification = require('../../../utils/push_notification');
const saveNotificationModel = require('../../../database/modals/notification/notification_save_token');
const favoriteModal = require('../../../database/modals/favorite/favorite_add');
const validUser = require('../../../middleware/valid_user');
const generateOTP = require('../../../utils/generate_otp');
const is_Session = require('../../../middleware/is_Session')


router.get(
	'/listing/buyer/verification',
	is_Session,
	logEvent,
	async (req, res) => {
		try {
			const User = req.session.User;
			const listingId = req.query.listingId;
			const mobileNumber = User.mobileNumber;

			console.log(mobileNumber)

			const getListingObject = await saveRequestModal.findOne({
				mobileNumber: mobileNumber,
				listingId: listingId,
			});

			if (getListingObject) {
				const userUniqueId = getListingObject.userUniqueId;
				const userDetails = await createUserModal.findOne({
					userUniqueId: userUniqueId,
				});

				const isMatchFound = userDetails.mobileNumber === mobileNumber;
				if (!isMatchFound) {
					res.status(200).json({
						reason: 'Mobile number not found',
						statusCode: 401,
						status: 'UNAUTHORIZED',
					});
					return;
				} else {
					res.status(200).json({
						reason: 'Listing found successfully',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			} else {
				res.status(200).json({
					reason: 'Mobile number not found',
					statusCode: 401,
					status: 'UNAUTHORIZED',
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	}
);

router.get('/listing/allUniqueList', logEvent, async (req, res) => {
	try {
		let listingObject = await saveListingModal.find({});

		let uniqueList = [];
		let uniqueIds = [];
		listingObject.forEach((element) => {
			//  find by make, marketingName & userUniqueId and then push
			const isFound = uniqueList.find(
				(item) =>
					item.make === element.make &&
					item.marketingName === element.marketingName &&
					item.userUniqueId === element.userUniqueId
			);
			if (!isFound) {
				uniqueList.push(element);
			}
		});
		// get userUniqueId from uniqueList and then push to uniqueIds
		uniqueList.forEach((element) => {
			if (!uniqueIds.includes(element.userUniqueId)) {
			}
			uniqueIds.push(element.userUniqueId);
		});

		res.status(200).json({
			reason: 'Unique listing found successfully',
			statusCode: 200,
			status: 'SUCCESS',
			data: uniqueList,
			uniqueIds: uniqueIds,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get(
	'/listing/sendverification',
	is_Session,
	logEvent,
	async (req, res) => {
		const listingId = req.query.listingId;
		const userUniqueId = req.session.User.userUniqueId;

		const clientOTP = generateOTP();

		try {
			const isValidUser = await createUserModal.findOne({
				userUniqueId: userUniqueId,
			});

			if (isValidUser) {
				let listingObject = await saveListingModal.findOne({
					listingId: listingId,
				});
				if (listingObject.userUniqueId != userUniqueId) {
					const getRequestObject = await saveRequestModal.findOne({
						mobileNumber: isValidUser.mobileNumber,
						listingId: listingId,
					});

					if (!getRequestObject) {
						const data = {
							listingId: listingId,
							userUniqueId: userUniqueId,
							mobileNumber: isValidUser.mobileNumber,
						};
						const saveRequest = new saveRequestModal(data);
						let dataObject = await saveRequest.save();

						if (!dataObject) {
							res.status(500).json({
								reason: 'Some error occured',
								statusCode: 500,
								status: 'SUCCESS',
							});
							return;
						} else {
							// let listingObject = await saveListingModal.findOne({
							//   listingId: listingId,
							// });

							let sellerUniqueId = listingObject.userUniqueId;
							let marketingName = listingObject.marketingName;
							let sellerName = listingObject.listedBy;
							let sellerContactNumber = listingObject.mobileNumber;

							const response = await sendNotification(
								sellerUniqueId,
								true,
								marketingName,
								sellerName,
								sellerContactNumber,
								clientOTP
							);
							const findFavorite = await favoriteModal.findOne({
								userUniqueId: userUniqueId,
							});

							let addToFavorite = {};
							if (findFavorite && findFavorite.userUniqueId) {
								addToFavorite = await favoriteModal.findByIdAndUpdate(
									findFavorite._id,
									{
										$push: {
											fav_listings: listingId,
										},
									},
									{ new: true }
								);
							} else {
								addToFavorite = await favoriteModal.create({
									userUniqueId: userUniqueId,
									fav_listings: [listingId],
								});
							}
							if (addToFavorite) {
								res.status(201).json({
									reason: 'Request sent successfully',
									statusCode: 200,
									status: 'SUCCESS',
									dataObject,
								});
							}
						}
					} else {
						res.status(200).json({
							reason:
								'You have already sent verification request for this listing',
							statusCode: 204,
							status: 'SUCCESS',
						});
					}
				} else {
					res.status(200).json({
						reason: "You can't send verification request to yourself",
						statusCode: 202,
						status: 'SUCCESS',
					});
				}
			} else {
				res.status(200).json({
					reason: 'Invalid user id provided',
					statusCode: 401,
					status: 'SUCCESS',
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	}
);

module.exports = router;
