const express = require('express');
const router = express.Router();
const moment = require('moment');
const saveRequestModal = require('../../../database/modals/device/request_verification_save');

const dotenv = require('dotenv');
dotenv.config();

// const FCM = require("fcm-node");
const fetch = require('node-fetch');
// const ObjectId = require("mongodb").ObjectId;

// const fs = require("fs");
// const path = require("path");

// require("../../../database/connection");
const saveListingModal = require('../../../database/modals/device/save_listing_device');
const createUserModal = require('../../../database/modals/login/login_create_user');
// const scrappedModal = require("../../../database/modals/others/scrapped_models");
const favoriteModal = require('../../../database/modals/favorite/favorite_add');
const is_Session = require('../../../middleware/is_Session');
// const scrappedExternalSourceModal = require("../../../database/modals/others/scrapped_for_external_source_models");
// const connection = require("../../../database/mysql_connection");

const logEvent = require('../../../middleware/log_event');
const getDefaultImage = require('../../../utils/get_default_image');
const getRecommendedPrice = require('../../../utils/get_recommended_price');
const saveNotificationModel = require('../../../database/modals/notification/notification_save_token');
const notificationModel = require('../../../database/modals/notification/complete_notifications');
const makeRandomString = require('../../../utils/generate_random_string');
// const lspModal = require("../../../database/modals/others/new_scrapped_models");
const testScrappedModal = require('../../../database/modals/others/test_scrapped_models');

const cityModal = require('../../../database/modals/global/cities_modal');

const allMatrix = require('../../../utils/matrix_figures');
const bestDealsModal = require('../../../database/modals/others/best_deals_models');
const validUser = require('../../../middleware/valid_user');
const createAgentModal = require('../../../database/modals/global/oru_mitra/agent_modal');
// const downloadImage = require("../../../utils/download_image_from_url");

router.get('/listings', is_Session, async (req, res) => {
	try {
		const User = req.session.User;
		const userUniqueId = User.userUniqueId; // const neededKeys = allMatrix.neededKeysForDeals;
		// let dataObject = await saveListingModal.find({ userUniqueId }, neededKeys);
		// dataObject.reverse();

		let dataObject = await saveListingModal.aggregate([
			{
				$match: {
					userUniqueId,
					// status can not be Sold_Out
					// status: {
					//   $ne: "Sold_Out",
					// },
				},
			},
			// change the status from Sold_Out to Paused of every listing
			// {
			//   $addFields: {
			//     status: {
			//       $cond: {
			//         if: {
			//           $eq: ["$status", "Sold_Out"],
			//         },
			//         then: "Paused",
			//         else: "$status",
			//       },
			//     },
			//   },
			// },
			{
				$sort: {
					_id: -1,
				},
			},
		]);

		if (!dataObject) {
			res.status(404).json({ message: 'User unique ID not found' });
			return;
		} else {
			let unVerifiedCount = await saveListingModal.countDocuments({
				userUniqueId,
				verified: false,
				status: { $nin: ['Sold_Out', 'Expired'] },
			});

			let soldOutListings = dataObject.filter((item) => {
				return item.status === 'Sold_Out' || item.status === 'Expired';
			});

			dataObject = dataObject.filter((item) => {
				return item.status !== 'Sold_Out' && item.status !== 'Expired';
			});

			// console.log("unVerifiedCount", unVerifiedCount);

			let msg =
				unVerifiedCount > 0
					? `You have ${unVerifiedCount} unverified listings. Verify them >`
					: '';

			// dataObject.reverse();
			res.status(200).json({
				reason: 'Listings found successfully',
				statusCode: 200,
				status: 'SUCCESS',
				message: msg,
				dataObject,
				soldOutListings,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/listing/save', is_Session, logEvent, async (req, res) => {
	const User = req.session.User;
	const userUniqueId = User.userUniqueId;
	let listedBy = req.body.listedBy;
	let associatedWith = '';
	let mobileNumber = '';

	const userDetails = await createUserModal.findOne(
		{
			userUniqueId: userUniqueId,
		},
		{ userName: 1, mobileNumber: 1, _id: 1, associatedWith: 1 }
	);

	if (userDetails) {
		if (userDetails?.userName == null || userDetails?.userName?.length === 0) {
			const userName = listedBy;
			const dataToBeUpdate = {
				userName: userName,
			};
			let data = await createUserModal.findByIdAndUpdate(
				userDetails._id,
				dataToBeUpdate,
				{
					new: true,
				}
			);
		} else {
			listedBy = userDetails?.userName;
		}

		mobileNumber = userDetails?.mobileNumber;

		if (userDetails?.associatedWith) {
			associatedWith = userDetails?.associatedWith;
		}

		const charger = req.body.charger;
		const color = req.body.color;
		let deviceCondition = req.body.deviceCondition;
		const deviceCosmeticGrade = req.body.deviceCosmeticGrade;
		const deviceFinalGrade = req.body.deviceFinalGrade;
		const deviceFunctionalGrade = req.body.deviceFunctionalGrade;
		const deviceStorage = req.body.deviceStorage;
		const earphone = req.body.earphone;
		const images = req.body.images;
		const imei = req.body.imei;
		let listingLocation = req.body.listingLocation;
		const listingPrice = req.body.listingPrice;
		const make = req.body.make;
		const marketingName = req.body.marketingName;
		// const mobileNumber = req.body.mobileNumber.toString().slice(2, -1);
		const model = req.body.model;
		const originalbox = req.body.originalbox;
		const platform = req.body.platform;
		const recommendedPriceRange = req.body.recommendedPriceRange;
		const deviceImagesAvailable = images.length > 0 ? true : false;
		const deviceRam = req.body.deviceRam;
		let deviceWarranty = req.body.warranty;
		let latLong = req.body.latLong;

		const cosmetic = req.body.cosmetic;

		// let getLocation = await cityModal.findOne({ city: listingLocation });
		// if (getLocation) {
		// 	listingLocation = getLocation.city;
		// } else {
		// 	await cityModal.create({ city: listingLocation, displayWithImage: '0' });
		// }

		if (deviceCondition == 'Like New') {
			switch (deviceWarranty) {
				case 'four':
					deviceCondition = 'Excellent';
					break;
				case 'seven':
					deviceCondition = 'Excellent';
					break;
				case 'more':
					deviceCondition = 'Good';
					break;
				default:
					deviceCondition = deviceCondition;
					break;
			}
		} else if (deviceCondition == 'Excellent') {
			switch (deviceWarranty) {
				case 'seven':
					deviceCondition = 'Excellent';
					break;
				case 'more':
					deviceCondition = 'Good';
					break;
				default:
					deviceCondition = deviceCondition;
					break;
			}
		}
		// else if (deviceCondition == "Good") {
		//   switch (deviceWarranty) {
		//     case "more":
		//       deviceCondition = "Fair";
		//       break;
		//     default:
		//       deviceCondition = deviceCondition;
		//       break;
		//   }
		// }

		switch (deviceWarranty) {
			case 'zero':
				deviceWarranty = 'More than 9 months';
				break;
			case 'four':
				deviceWarranty = 'More than 6 months';
				break;
			case 'seven':
				deviceWarranty = 'More than 3 months';
				break;
			case 'more':
				deviceWarranty = 'None';
				break;
			default:
				deviceWarranty = 'None';
				break;
		}

		const now = new Date();
		// const dateFormat = moment(now).format("L");
		const dateFormat = moment(now).format('MMM Do');

		//TODO - Add the exact default image as the model image
		//   const defaultImage = `https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make.toString().toLowerCase()}/mbr_Apple_iPhone_12_mini.png`

		const image = await getDefaultImage(marketingName);

		// const defaultImage = {
		//   fullImage: `https://zenrodeviceimages.s3-us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/${make.toString().toLowerCase()}/mbr_${marketingName.toLowerCase().replace(" ", "_")}.png`
		// }

		const defaultImage = {
			fullImage: image,
		};

		// stop user to save activated listing if he/she already has 5 unverified listings
		let limitExceeded =
			(await saveListingModal
				.find()
				.countDocuments({ userUniqueId, verified: false, status: 'Active' })) >=
			5;

		// stop user to save duplicate activated listing on basis of mobileNumber, marketingName, storage & ram
		let duplicated = limitExceeded
			? limitExceeded
			: (await saveListingModal.find().countDocuments({
					userUniqueId,
					marketingName,
					deviceStorage,
					deviceRam,
					verified: false,
			  })) >= 1;

		const data = {
			charger,
			color,
			deviceCondition,
			deviceCosmeticGrade,
			deviceFinalGrade,
			deviceFunctionalGrade,
			listedBy,
			latLong: latLong ? latLong : null,
			deviceStorage,
			earphone,
			images,
			imei,
			listingLocation,
			listingPrice: parseInt(listingPrice.toString()),
			make,
			marketingName,
			mobileNumber,
			model,
			originalbox,
			platform,
			recommendedPriceRange,
			userUniqueId,
			deviceImagesAvailable,
			defaultImage,
			deviceRam,
			listingDate: dateFormat,
			warranty: deviceWarranty,
			cosmetic,
			status: limitExceeded || duplicated ? 'Paused' : 'Active',
			associatedWith: associatedWith == '' ? null : associatedWith,
		};

		try {
			const modalInfo = new saveListingModal(data);
			const dataObject = await modalInfo.save();

			if (!limitExceeded && !duplicated) {
				let newData = {
					...data,
					notionalPercentage: -999999,
					status: limitExceeded || duplicated ? 'Sold_Out' : 'Active',
					imagePath:
						(images.length > 0
							? images[0].thumbImage || images[0].fullImage
							: '') ||
						(defaultImage.fullImage != '' ? defaultImage.fullImage : ''),
					listingId: dataObject.listingId,
					listingDate: moment(now).format('MMM Do'),
				};

				const tempModelInfo = new bestDealsModal(newData);
				if (tempModelInfo.make != null) {
					const tempDataObject = await tempModelInfo.save();
				}
			}

			// create dynamic string for response message reason on basis of limitExceeded and duplicated value

			let message = limitExceeded
				? // ? "Added Successfully but Paused because 5 listing Limit exceeded!"
				  'You have already exceeded your quota of unverified listings at ORU !\nYou can go to my listing page and delete your old unvarified listings or you can convert them into verified listings\n\nOR\n\nYou can download the app and verify this device.'
				: duplicated
				? // ? "Added Successfully but Paused because This exact listing already present!"
				  'You have already listed same device at ORU for sell !\nYou can go to my listing page and select edit option, if you want to modify your existing listing.\n\nOR\n\nYou can download the app and verify this device.'
				: 'Listing saved successfully';

			res.status(201).json({
				// reason: "Listing saved successfully",
				reason: message,
				statusCode: 201,
				status: 'SUCCESS',
				type: limitExceeded
					? 'Unverified Listings Limit Exceeded'
					: duplicated
					? 'Duplicate Listing'
					: '',
				dataObject: dataObject,
			});
			return;
		} catch (error) {
			console.log(error);
			res.status(400).json(error);
		}
	} else {
		res.status(200).json({
			reason: 'Invalid user unique id provided',
			statusCode: 200,
			status: 'FAILURE',
		});
		return;
	}
});

router.post('/listing/delete', is_Session, logEvent, async (req, res) => {
	const userUniqueId = req.session.User.userUniqueId;
	const listingId = req.query.listingId;

	try {
		const updateListing = await saveListingModal.findOne({
			listingId: listingId,
		});

		if (!updateListing) {
			res.status(200).json({
				reason: 'Invalid listing id provided',
				statusCode: 200,
				status: 'SUCCESS',
			});
			return;
		} else {
			if (updateListing.userUniqueId === userUniqueId) {
				const deleletedListing = await saveListingModal.findOneAndUpdate(
					{
						listingId: listingId,
					},
					{
						status: 'Sold_Out',
					}
				);
				// const updatedListings = await bestDealsModal.findByIdAndUpdate(
				//   updatedListings.listingId,
				//   {
				//     status: "Sold_Out",
				//   },
				//   {
				//     new: true,
				//   }
				// );
				// console.log("updatedListings", updatedListings);
				const updatedListings = await bestDealsModal.findOne({
					listingId: deleletedListing.listingId,
				});
				if (updatedListings && updatedListings.make != null) {
					updatedListings.status = 'Sold_Out';
					updatedListings.notionalPercentage =
						!updatedListings.notionalPercentage ||
						updatedListings.notionalPercentage == NaN ||
						updatedListings.notionalPercentage.toString() == 'NaN' ||
						updatedListings.notionalPercentage == undefined ||
						updatedListings.notionalPercentage.toString() == 'undefined'
							? -999999
							: updatedListings.notionalPercentage;
					updatedListings.save();
				}
				res.status(200).json({
					reason: 'Listing deleted successfully',
					statusCode: 200,
					status: 'SUCCESS',
					updateListing,
				});
			} else {
				res.status(200).json({
					reason: 'You are not authorized to delete this listing',
					statusCode: 200,
					status: 'SUCCESS',
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.post('/listing/update', is_Session, logEvent, async (req, res) => {
	const userUniqueId = req.session.User.userUniqueId;
	const listingId = req.body.listingId;
	const charger = req.body.charger;
	const color = req.body.color;
	let deviceCondition = req.body.deviceCondition;
	const deviceStorage = req.body.deviceStorage;
	const deviceRam = req.body.deviceRam;
	const earphone = req.body.earphone;
	const images = req.body.images;
	const imei = req.body.imei;
	const listingLocation = req.body.listingLocation;
	const listingPrice = req.body.listingPrice;
	const originalbox = req.body.originalbox;
	const recommendedPriceRange = req.body.recommendedPriceRange;
	const cosmetic = req.body.cosmetic;
	let warranty = req.body.warranty;
	let latLong = req.body.latLong;

	try {
		const updateListing = await saveListingModal.findOne({
			listingId: listingId,
		});

		if (!updateListing) {
			res.status(200).json({
				reason: 'Invalid listing id provided',
				statusCode: 200,
				status: 'SUCCESS',
			});
			return;
		} else {
			if (deviceCondition == 'Like New') {
				switch (warranty) {
					case 'four':
						deviceCondition = 'Excellent';
						break;
					case 'seven':
						deviceCondition = 'Excellent';
						break;
					case 'more':
						deviceCondition = 'Good';
						break;
					default:
						deviceCondition = deviceCondition;
						break;
				}
			} else if (deviceCondition == 'Excellent') {
				switch (warranty) {
					case 'seven':
						deviceCondition = 'Excellent';
						break;
					case 'more':
						deviceCondition = 'Good';
						break;
					default:
						deviceCondition = deviceCondition;
						break;
				}
			}
			// else if (deviceCondition == "Good") {
			//   switch (deviceWarranty) {
			//     case "more":
			//       deviceCondition = "Fair";
			//       break;
			//     default:
			//       deviceCondition = deviceCondition;
			//       break;
			//   }
			// }

			switch (warranty) {
				case 'zero':
					warranty = 'More than 9 months';
					break;
				case 'four':
					warranty = 'More than 6 months';
					break;
				case 'seven':
					warranty = 'More than 3 months';
					break;
				case 'more':
					warranty = 'None';
					break;
				default:
					warranty = 'None';
			}

			if (updateListing.userUniqueId === userUniqueId) {
				let dataToBeUpdate = {
					charger,
					color,
					deviceCondition,
					earphone,
					images,
					listingLocation,
					listingPrice,
					originalbox,
					imei,
					latLong: latLong ? latLong : null,
					recommendedPriceRange,
					deviceStorage,
					deviceRam,
					cosmetic:
						cosmetic == {} || cosmetic == null || !cosmetic
							? updateListing.cosmetic
							: cosmetic,
					warranty,
				};
				if (updateListing?.deviceCondition === deviceCondition) {
					dataToBeUpdate = { ...dataToBeUpdate };
				} else {
					dataToBeUpdate = {
						...dataToBeUpdate,
						verified: false,
						verifiedDate: '',
						functionalTestResults: [],
					};
				}

				const dataObject = await saveListingModal.findByIdAndUpdate(
					updateListing._id,
					dataToBeUpdate,
					{
						new: true,
					}
				);
				const updatedListings = await bestDealsModal.findOne({
					listingId: dataObject.listingId,
				});
				if (updatedListings) {
					updatedListings.charger = charger;
					updatedListings.color = color;
					updatedListings.deviceCondition = deviceCondition;
					updatedListings.earphone = earphone;
					updatedListings.images = images;
					updatedListings.listingLocation = listingLocation;
					updatedListings.listingPrice = listingPrice;
					updatedListings.originalbox = originalbox;
					updatedListings.recommendedPriceRange = recommendedPriceRange;
					updatedListings.deviceStorage = deviceStorage;
					updatedListings.deviceRam = deviceRam;
					updatedListings.cosmetic =
						cosmetic == {} ? updateListing.cosmetic : cosmetic;
					updatedListings.warranty = warranty;
					updatedListings.verified =
						updateListing?.deviceCondition === deviceCondition
							? updatedListings.verified
							: false;
					updatedListings.verifyDate =
						updateListing?.deviceCondition === deviceCondition
							? updatedListings.verifyDate
							: '';
					updatedListings.functionalTestResults =
						updateListing?.deviceCondition === deviceCondition
							? updatedListings.functionalTestResults
							: [];
					if (updatedListings.make != null) {
						updatedListings.save();
					}
				}
				res.status(200).json({
					reason: 'Listing updated successfully',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject,
				});
			} else {
				res.status(200).json({
					reason: 'You are not authorized to update this listing',
					statusCode: 200,
					status: 'SUCCESS',
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.post('/listing/pause', is_Session, logEvent, async (req, res) => {
	const userUniqueId = req.session.User.userUniqueId;
	const listingId = req.query.listingId;

	try {
		const pauseListing = await saveListingModal.find({
			listingId: listingId,
		});

		if (!pauseListing) {
			res.status(200).json({
				reason: 'Invalid listing id provided',
				statusCode: 200,
				status: 'SUCCESS',
			});
			return;
		} else {
			if (pauseListing[0]?.userUniqueId !== userUniqueId) {
				res.status(200).json({
					reason: 'You are not authorized to pause this listing',
					statusCode: 200,
					status: 'SUCCESS',
				});
			} else {
				const pausedListing = await saveListingModal.findByIdAndUpdate(
					pauseListing[0]?._id,
					{
						status: 'Paused',
					},
					{
						new: true,
					}
				);
				// update bestdealmodel status
				const updatedListings = await bestDealsModal.findOne({
					listingId: pausedListing.listingId,
				});
				if (updatedListings && updatedListings.make != null) {
					updatedListings.status = 'Sold_Out';
					updatedListings.save();
				}

				res.status(200).json({
					reason: 'Listing paused successfully',
					statusCode: 200,
					status: 'SUCCESS',
					pausedListing,
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.post('/listing/activate', is_Session, logEvent, async (req, res) => {
	const userUniqueId = req.session.User.userUniqueId;
	const listingId = req.query.listingId;

	try {
		const activateListing = await saveListingModal.find({
			listingId: listingId,
		});

		// stop user to save activated listing if he/she already has 5 unverified listings
		let limitExceeded =
			(await saveListingModal
				.find()
				.countDocuments({ userUniqueId, verified: false, status: 'Active' })) >=
			5;

		// stop user to save duplicate activated listing on basis of mobileNumber, marketingName, storage & ram
		let duplicated = limitExceeded
			? limitExceeded
			: (await saveListingModal.find().countDocuments({
					mobileNumber: activateListing[0]?.mobileNumber,
					marketingName: activateListing[0]?.marketingName,
					deviceStorage: activateListing[0]?.deviceStorage,
					deviceRam: activateListing[0]?.deviceRam,
					verified: false,
					status: 'Active',
			  })) >= 1;

		if (!activateListing) {
			res.status(200).json({
				reason: 'Invalid listing id provided',
				statusCode: 200,
				status: 'SUCCESS',
			});
			return;
		} else if (limitExceeded || duplicated) {
			// reason message for limitExceeded & duplicated
			const reasonMsg = limitExceeded
				? 'You are not allowed to activate more then 5 unverified listings.'
				: duplicated
				? 'Looks like your activated listing for this device is available on our platform. Please verify your listing.'
				: ``;

			res.status(200).json({
				reason: reasonMsg,
				statusCode: 200,
				status: 'SUCCESS',
			});
		} else if (activateListing[0].status == 'Expired') {
			res.status(200).json({
				reason: 'Expired listing cannot be activated',
				statusCode: 200,
				status: 'SUCCESS',
			});
		} else {
			if (activateListing[0].userUniqueId !== userUniqueId) {
				res.status(200).json({
					reason: 'You are not authorized to activate this listing',
					statusCode: 200,
					status: 'SUCCESS',
				});
			} else {
				const activatedListing = await saveListingModal.findByIdAndUpdate(
					activateListing[0]?._id,
					{
						status: 'Active',
					},
					{
						new: true,
					}
				);

				// update bestdealmodel status
				const updatedListings = await bestDealsModal.findOne({
					listingId: activatedListing.listingId,
				});
				if (updatedListings && updatedListings.make != null) {
					updatedListings.status = 'Active';
					updatedListings.save();
				} else {
					let newListings = await saveListingModal.findOne(
						activateListing[0]?._id
					);

					newListings = newListings._doc ? newListings._doc : newListings;

					// create new bestdealmodel
					if (newListings && newListings.make != null) {
						const newBestDeal = new bestDealsModal({
							...newListings,
							status: 'Active',
						});
						newBestDeal.save();
					}
				}

				res.status(200).json({
					reason:
						'Listing activated successfully\nIt will be appear on marketplace within 24 hours.',
					statusCode: 200,
					status: 'SUCCESS',
					activatedListing,
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

router.get(
	'/listing/user/mobilenumber',
	is_Session,
	logEvent,
	async (req, res) => {
		try {
			const userUniqueId = req.session.User.userUniqueId;
			const listingId = req.query.listingId;

			let isOruMitra = req.query.isOruMitra || false;

			switch (isOruMitra) {
				case 'true':
					isOruMitra = true;
					break;
				case true:
					isOruMitra = true;
					break;
				case 'false':
					isOruMitra = false;
					break;
				case false:
					isOruMitra = false;
					break;
				default:
					isOruMitra = false;
			}

			if (isOruMitra) {
				const isValidUser = await createAgentModal.findOne({
					userUniqueId: userUniqueId,
					type: ['OruMitra', 'Broker'],
				});

				if (isValidUser) {
					const listing = await saveListingModal.findOne(
						{
							listingId: listingId,
						},
						{ mobileNumber: 1, associatedWith: 1 }
					);
					if (listing) {
						const dataObject = {
							mobileNumber: listing.mobileNumber || '',
						};

						res.status(200).json({
							reason: 'Mobile number retrieved successfully',
							statusCode: 200,
							status: 'SUCCESS',
							dataObject,
						});
					} else {
						res.status(200).json({
							reason: 'Invalid listing id provided',
							statusCode: 200,
							status: 'SUCCESS',
						});
					}
				} else {
					res.status(200).json({
						reason: 'You are not authorized to perform this action',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			} else {
				const isValidUser = await createUserModal.findOne({
					userUniqueId: userUniqueId,
				});

				if (isValidUser) {
					// find count of saveRequestModal entries for this userUniqueId in last 24 hours
					const count = await saveRequestModal.countDocuments({
						userUniqueId: userUniqueId,
						createdAt: {
							$gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
						},
					});

					if (count < 15) {
						const listing = await saveListingModal.findOne(
							{
								listingId: listingId,
							},
							{ mobileNumber: 1, associatedWith: 1 }
						);
						let mobileNumber = listing.mobileNumber;
						let associatedWith = listing.associatedWith;

						if (associatedWith) {
							let associateData = await createAgentModal.findOne(
								{
									referralCode: associatedWith,
								},
								{ mobileNumber: 1 }
							);
							if (associateData) {
								mobileNumber = associateData.mobileNumber;
							}
						}

						const dataObject = {
							mobileNumber,
						};

						res.status(200).json({
							reason: 'Mobile number retrieved successfully',
							statusCode: 200,
							status: 'SUCCESS',
							dataObject,
						});

						const getListingObject = await saveRequestModal.findOne({
							mobileNumber: mobileNumber,
							listingId: listingId,
						});

						if (!getListingObject) {
							const data = {
								listingId: listingId,
								userUniqueId: userUniqueId,
								mobileNumber: isValidUser.mobileNumber,
							};

							const saveRequest = new saveRequestModal(data);
							let savedData = await saveRequest.save();

							const dataObject = {
								mobileNumber,
							};

							// res.status(200).json({
							//   reason: "Mobile number retrieved successfully",
							//   statusCode: 200,
							//   status: "SUCCESS",
							//   dataObject,
							// });
						}
					} else {
						res.status(200).json({
							reason:
								'You have reached maximum limit of 15 requests last in 24 hours',
							statusCode: 200,
							status: 'SUCCESS',
							dataObject: {
								mobileNumber: 'Limit Exceeded',
							},
						});
					}
				} else {
					res.status(200).json({
						reason: 'Invalid user id provided',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			}
		} catch (error) {
			console.log(error);
			res.status(500).json(error);
		}
	}
);

router.get('/listing/detail', is_Session, logEvent, async (req, res) => {
	try {
		const userUniqueId = req.session.User.userUniqueId;
		const listingId = req.query.listingId;
	
		// const isValidUser = await createUserModal.find({
		//   userUniqueId: userUniqueId,
		// });
		const validListing = await saveListingModal.findOne({
			listingId: listingId,
			userUniqueId: userUniqueId,
		});

		// const validListing = await saveListingModal.aggregate([
		//   {
		//     $match: {
		//       listingId: listingId,
		//       userUniqueId: userUniqueId,
		//     },
		//   },
		// ]);

		if (validListing) {
			// const dataObject = validListing;
			res.status(200).json({
				reason: 'Listing found successfully',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject: validListing,
			});
		} else {
			res.status(200).json({
				reason: 'Invalid user id provided',
				statusCode: 200,
				status: 'SUCCESS',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post(
	'/listing/updatefordiag',
	is_Session,
	logEvent,
	async (req, res) => {
		const userUniqueId = req.session.User.userUniqueId;
		const listingId = req.body.listingId;

		const recommendedPriceRange = req.body.recommendedPriceRange;
		const deviceRam = req.body.deviceRam;
		const listingPrice = req.body.listingPrice;
		const deviceCondition = req.body.deviceCondition;
		const images = req.body.images;

		const now = new Date();
		const dateFormat = moment(now).format('MMM Do');

		const dataToBeUpdate = {
			// ...req.body,
			// verified: true,
			// status: "Active",
			// listingDate: dateFormat,
			// verifiedDate: dateFormat,
			recommendedPriceRange: recommendedPriceRange,
			deviceRam: deviceRam,
			listingPrice: listingPrice,
			// deviceCondition: deviceCondition,
			images: images,
		};

		try {
			const updateListing = await saveListingModal.findOne({
				listingId: listingId,
			});

			if (!updateListing) {
				res.status(200).json({
					reason: 'Invalid listing id provided',
					statusCode: 200,
					status: 'SUCCESS',
				});
				return;
			} else {
				if (updateListing.userUniqueId === userUniqueId) {
					let dataObject = await saveListingModal.findByIdAndUpdate(
						updateListing._id,
						dataToBeUpdate,
						{
							new: true,
						}
					);

					let dataObject2 = await bestDealsModal.findOneAndUpdate(
						{ listingId: updateListing.listingId },
						dataToBeUpdate,
						{
							new: true,
						}
					);

					const userFromFavorite = await favoriteModal.find({
						fav_listings: listingId,
					});

					const sendNotificationToUser = [];
					userFromFavorite.forEach((item, index) => {
						sendNotificationToUser.push(item.userUniqueId);
					});

					const now = new Date();
					const currentDate = moment(now).format('MMM Do');

					const string = await makeRandomString(25);

					let tokenObject = await saveNotificationModel.find({
						userUniqueId: sendNotificationToUser,
					});

					let notificationTokens = [];
					tokenObject.forEach((item, index) => {
						notificationTokens.push(item.tokenId);
					});

					var notification_body = {
						registration_ids: notificationTokens,
						notification: {
							title: `Congratulations!!!`,
							body: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
							sound: 'default',
							//   click_action: "FCM_PLUGIN_ACTIVITY",
							icon: 'fcm_push_icon',
						},
						data: {
							title: `Congratulations!!!`,
							body: {
								source: 'ORU Phones',
								messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
							},
							appEventAction: 'MY_FAVORITES',
							webEventAction: 'MY_FAVORITES',
						},
					};

					fetch('https://fcm.googleapis.com/fcm/send', {
						method: 'POST',
						headers: {
							// replace authorization key with your key
							Authorization: 'key=' + process.env.FCM_KEY,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(notification_body),
					})
						.then(function (response) {
							// console.log(response);
						})
						.catch(function (error) {
							console.error(error);
						});

					//Save notification to database
					let notificationData = {
						appEventAction: 'MY_FAVORITES',
						webEventAction: 'MY_FAVORITES',
						messageContent: `${updateListing.marketingName} that is in your favourites has been verified by the seller.`,
						notificationId: string,
						createdDate: currentDate,
					};

					sendNotificationToUser.forEach(async (user, index) => {
						let dataToBeSave = {
							userUniqueId: user,
							notification: [notificationData],
						};

						const notificationObject = await notificationModel.findOne({
							userUniqueId: user,
						});

						if (!notificationObject) {
							const saveNotification = new notificationModel(dataToBeSave);
							let dataObject = await saveNotification.save();
						} else {
							const updateNotification =
								await notificationModel.findByIdAndUpdate(
									notificationObject._id,
									{ $push: { notification: notificationData } },
									{ new: true }
								);
						}
					});

					res.status(200).json({
						reason: 'Listing updated successfully',
						statusCode: 200,
						status: 'SUCCESS',
						dataObject,
					});
				} else {
					res.status(200).json({
						reason: 'You are not authorized to update this listing',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			}
		} catch (error) {
			console.log(error);
			res.status(400).json(error);
		}
	}
);

router.post(
	'/listing/detailwithuserinfo',
	is_Session,
	logEvent,
	async (req, res) => {
		const listingid = req.query.listingid;
		const isOtherVendor = req.query.isOtherVendor;
		const userUniqueId = req.session.User.userUniqueId;
		let isLimited = req.query.isLimited || 'false';

		switch (isLimited) {
			case 'true':
				isLimited = true;
				break;
			case true:
				isLimited = true;
				break;
			case 'false':
				isLimited = false;
				break;
			case false:
				isLimited = false;
				break;
			default:
				isLimited = false;
				break;
		}

		// console.log("query", listingid, isOtherVendor, userUniqueId);

		// let testScrappedModalData = await testScrappedModal.find({
		//   type: 'sell',
		//   vendor_id: 8
		// });

		const unwantKeysForTable = allMatrix.unwantedKeysForTables;

		const VENDORS = {
			6: 'Amazon',
			7: 'Quikr',
			8: 'Cashify',
			9: '2Gud',
			10: 'Budli',
			11: 'Paytm',
			12: 'Yaantra',
			13: 'Sahivalue',
			14: 'Shopcluse',
			15: 'Xtracover',
			16: 'Mobigarage',
			17: 'Instacash',
			18: 'Cashforphone',
			19: 'Recycledevice',
			20: 'Quickmobile',
			21: 'mbr_Buyblynk',
			22: 'mbr_Electronicbazaar',
			23: 'Flipkart',
			26: 'OLX',
		};

		try {
			// const isValidUser = await createUserModal.find({
			//   userUniqueId: userUniqueId,
			// })

			let favList = [];
			if (userUniqueId != 'Guest' && isOtherVendor != 'Y') {
				const getFavObject = await favoriteModal.findOne({
					userUniqueId: userUniqueId,
				});

				if (getFavObject) {
					favList = getFavObject.fav_listings;
				} else {
					favList = [];
				}
			}

			let findingData = {};
			// if (isOtherVendor == "N") {
			findingData = {
				listingId: listingid,
			};
			let getListing = await bestDealsModal.findOne(findingData);

			if (!getListing) {
				res.status(200).json({
					reason: 'Invalid listing id provided',
					statusCode: 200,
					status: 'SUCCESS',
				});
				return;
			} else {
				let externalSource = [];
				let compareData = [];

				let associatedWithId = getListing.associatedWith;

				if (associatedWithId) {
					let associateData = await createAgentModal.findOne({
						referralCode: associatedWithId,
					});

					if (associateData) {
						let addr = associateData.address || '';
						let city = associateData.city || '';
						let newAddr = addr + ', ' + city;

						getListing.listedBy = associateData.name;
						getListing.listingLocation =
							newAddr == ', ' ? getListing.listingLocation : newAddr;
					}
				}

				let dataObject = {
					externalSource,
					compareData,
					similarListTable: [],
					...(getListing._doc || getListing),
				};

				if (!isLimited) {
					let findingBestData = {
						marketingName: getListing?.marketingName,
						deviceStorage: getListing?.deviceStorage,
						deviceCondition: getListing?.deviceCondition,
						isOtherVendor: 'N',
						mobiru_condition: getListing?.deviceCondition,
						status: 'Active',
						$expr: {
							$and: [
								{
									$ne: ['$notionalPercentage', NaN],
								},
								{
									$gte: [
										{
											$toInt: '$notionalPercentage',
										},
										0,
									],
								},
								{
									$lte: [
										{
											$toInt: '$notionalPercentage',
										},
										40,
									],
								},
							],
						},
					};

					if (getListing?.make != 'Apple') {
						findingBestData['deviceRam'] = getListing?.deviceRam;
					}

					let oruBests = await bestDealsModal
						.find(findingBestData, unwantKeysForTable)
						.limit(3);

					let tempStr = getListing?.deviceStorage;
					tempStr = tempStr.replace('GB', '').trim();

					let findingData = {
						model_name: {
							$regex: new RegExp(
								'^' + getListing?.marketingName.toLowerCase() + '$',
								'i'
							),
						},
						storage: parseInt(tempStr),
						type: ['buy', 'Buy'],
						mobiru_condition: getListing?.deviceCondition,
						// isOtherVendor: "Y",
					};

					if (getListing?.make != 'Apple') {
						let ram = getListing?.deviceRam;
						ram = ram.replace('GB', '').trim();
						findingData['ram'] = parseInt(ram); //["deviceRam"] & remove parseInt()
					}

					let scrappedModelsTemp = await testScrappedModal.find(findingData);
					// console.log("scrappedModels", scrappedModels.length, findingData);
					// let scrappedModels = testScrappedModal
					// console.log("scrappedModels", scrappedModels);

					let listingIds = scrappedModelsTemp.map((item) =>
						item._id.toString()
					);

					// console.log("listingIds", listingIds);
					let scrappedModels = await bestDealsModal.find(
						{
							// listingid: { $in: listingIds },
							listingId: listingIds,
							status: 'Active',
						},
						unwantKeysForTable
					);

					// console.log("scrappedModels", scrappedModels.length);

					let selectdModels = [];
					// let itemId = "";
					// const marketingname = getListing.marketingName;
					// const condition = getListing.deviceCondition;
					// const storage = getListing.deviceStorage;
					// let leastSellingPrice;

					let pushedVendors = [];
					// console.log("vendorImage", scrappedModels);
					scrappedModels.forEach((vendor, index) => {
						vendor = vendor._doc || vendor;
						// if (
						//   item.model === marketingname &&
						//   item.condition === condition &&
						//   item.storage === storage
						// ) {
						//   item.vendor.forEach((vendor) => {
						// console.log("vendor", vendor);
						vendorName = vendor.vendorId ? VENDORS[vendor.vendorId] : '';
						// console.log("vendorName", vendorName);
						// console.log("vendor", vendor);
						// vendorName = VENDORS[vendor.vendor_id];
						vendorImage = `https://d1tl44nezj10jx.cloudfront.net/devImg/vendors/${vendorName
							.toString()
							.toLowerCase()}_logo.png`;

						const dy_img =
							// getListing?.listingId == vendor._id.toString()
							//   ? "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/oru/product/mobiledevices/img/txt_phone.png":
							vendorImage;

						let vendorObject = {
							externalSourcePrice: vendor.listingPrice,
							externalSourceImage: dy_img,
							productLink: vendor.vendorLink ? vendor.vendorLink : '',
							listingId: vendor.listingId.toString(),
							Object: vendor,
							location: 'India',
							// warranty: vendor.warranty,
						};
						// let vendorObject = {
						//   externalSourcePrice: vendor.price,
						//   externalSourceImage: dy_img,
						//   productLink: vendor.link ? vendor.link : "",
						//   listingId: vendor._id.toString(),
						//   warranty: vendor.warranty,
						// };
						if (!pushedVendors.includes(vendorName)) {
							if (getListing?.vendorLogo != vendorObject.externalSourceImage) {
								// compareData.push(vendorObject);
								// delete vendorObject.Object;
								selectdModels.push(vendorObject);
								pushedVendors.push(vendorName);
							}
						}
						//   });
						// }
					});

					// add oruBest to the selectdModels
					// console.log("oruBest", oruBest);
					if (oruBests.length > 0) {
						await oruBests.forEach((oruBest) => {
							let dy_link =
								oruBest?.listingId == getListing?.listingId
									? ''
									: `${process.env.SERVER_URL}/product/buy-old-refurbished-used-mobiles/${oruBest?.make}/${oruBest?.marketingName}/${oruBest?.listingId}?isOtherVendor=N`;

							// replace spaces with %20 in dy_link
							dy_link = dy_link.replace(/ /g, '%20');
							const dy_img =
								oruBest?.listingId == getListing?.listingId
									? 'https://d1tl44nezj10jx.cloudfront.net/devImg/oru/product/mobiledevices/img/txt_phone.png'
									: 'https://d1tl44nezj10jx.cloudfront.net/devImg/oru/product/mobiledevices/img/oru_logo.png';

							let vendorObject = {
								externalSourcePrice: parseInt(oruBest?.listingPrice),
								externalSourceImage: dy_img,
								productLink: dy_link,
								userName: oruBest?.listedBy,
								listingId: oruBest?.listingId,
								Object: oruBest,
								location: oruBest?.listingLocation,
							};
							// compareData.push(vendorObject);
							// delete vendorObject.Object;
							externalSource.push(vendorObject);
						});
					}

					// push getListing to the externalSource if it's listingId Object is not in the externalSource
					if (
						!externalSource.some(
							(item) => item.listingId == getListing?.listingId
						) &&
						!selectdModels.some(
							(item) => item.listingId == getListing?.listingId
						)
					) {
						let vendorObject = {
							externalSourcePrice: parseInt(
								getListing?.listingPrice
							).toString(),
							externalSourceImage:
								'https://d1tl44nezj10jx.cloudfront.net/devImg/oru/product/mobiledevices/img/txt_phone.png',
							productLink: '',
							userName: getListing?.listedBy,
							listingId: getListing?.listingId,
							Object: getListing,
							location: getListing?.listingLocation,
						};
						// compareData.push(vendorObject);
						// delete vendorObject.Object;
						selectdModels.push(vendorObject);
					}

					if (selectdModels.length > 0) {
						// console.log("selectdModels", selectdModels);
						// sort selectdModels by price
						selectdModels.sort((b, a) => {
							return b.externalSourcePrice - a.externalSourcePrice;
						});
						// externalSource.push(vendorObject);
						externalSource.push(...selectdModels);
					}

					let tempExternalSource = [];
					externalSource.forEach((item) => {
						compareData.push(item);
						let vendorObject = {
							externalSourcePrice: item.externalSourcePrice,
							externalSourceImage: item.externalSourceImage,
							productLink: item.productLink,
							userName: item.userName,
							listingId: item.listingId,
							Object:
								item.Object != undefined && item.Object.isOtherVendor == 'N'
									? item.Object
									: undefined,
						};
						if (
							getListing?.listingId == item.listingId &&
							(getListing.notionalPercentage == null ||
								getListing.notionalPercentage == '' ||
								getListing.notionalPercentage == undefined ||
								getListing.notionalPercentage < 0 ||
								getListing.notionalPercentage > 40)
						) {
						} else {
							tempExternalSource.push(vendorObject);
						}
					});

					externalSource = tempExternalSource;

					let thisListingPrice = parseInt(getListing?.listingPrice);
					let newExpr = {
						// deviceCondition: ["Like New", getListing?.deviceCondition],
						$expr: {
							$and: [
								{
									$gte: [
										{
											$toInt: '$listingPrice',
										},
										parseInt(thisListingPrice * 0.9),
									],
								},
								{
									$lte: [
										{
											$toInt: '$listingPrice',
										},
										parseInt(thisListingPrice * 1.2),
									],
								},
								// ],
								// $and: [
								// notionalPercentage should be between 0 and 40
								{
									$gte: [
										// {
										//   $toInt: {
										//     $toString: "$notionalPercentage",
										//   },
										// },
										'$notionalPercentage',
										0,
									],
								},
								{
									$lte: [
										// {
										//   $toInt: {
										//     $toString: "$notionalPercentage",
										//   },
										// },
										'$notionalPercentage',
										40,
									],
								},
							],
						},
					};

					if (getListing?.make == 'Apple') {
						newExpr['$expr']['$and'].push({
							$eq: ['$make', 'Apple'],
						});
					}

					let getSimilarTable = [];
					getSimilarTable = await bestDealsModal
						.find(newExpr, {
							_id: 0,
							storeId: 0,
							color: 0,
							deviceCosmeticGrade: 0,
							deviceFinalGrade: 0,
							deviceFunctionalGrade: 0,
							images: 0,
							imei: 0,
							model: 0,
							platform: 0,
							agent: 0,
							recommendedPriceRange: 0,
							cosmetic: 0,
							questionnaireResults: 0,
							functionalTestResults: 0,
							createdAt: 0,
							updatedAt: 0,
							__v: 0,
						})
						.limit(5)
						.exec();

					if (
						getSimilarTable &&
						getSimilarTable.length > 0 &&
						!getSimilarTable.some(
							(item) => item.listingId == getListing?.listingId
						)
					) {
						// getSimilarTable.unshift(getListing);
						let tempTable = [];
						tempTable.push(getListing);
						tempTable.push(...getSimilarTable);
						getSimilarTable = tempTable;
					}

					if (
						getSimilarTable.length == 1 &&
						getSimilarTable.some(
							(item) => item.listingId == getListing?.listingId
						)
					) {
						getSimilarTable = [];
					}

					dataObject = {
						externalSource,
						compareData: compareData.length > 1 ? compareData : [],
						similarListTable: getSimilarTable.length > 1 ? getSimilarTable : [],
						...(getListing._doc || getListing),
					};
				}
				let tempArray = [];
				tempArray.push(dataObject);

				// add favorite listings to the final list
				if (userUniqueId != 'Guest' && isOtherVendor != 'Y') {
					tempArray.forEach((item, index) => {
						if (favList.includes(item.listingId)) {
							dataObject = { ...dataObject, favourite: true };
						} else {
							dataObject = { ...dataObject, favourite: false };
						}
					});
				}
				// }
				// Remove mobileNumber from the response
				if (dataObject.mobileNumber) {
					delete dataObject.mobileNumber;
				}

				res.status(200).json({
					reason: 'Listing found successfully',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject,
				});
			}
		} catch (error) {
			console.log(error);
			res.status(400).json(error);
		}
	}
);

router.get('/listing/bydeviceid', is_Session, logEvent, async (req, res) => {
	const deviceId = req.query.deviceId;
	const userUniqueId = req.session.User.userUniqueId;
	const modelData = req.query.modelData;

	try {
		// const isValidUser = await createUserModal.find({
		//   userUniqueId: userUniqueId,
		// })

		const getListing = await saveListingModal.findOne({
			deviceUniqueId: deviceId,
			userUniqueId: userUniqueId,
			verified: true,
			// status can not be "Sold_Out" or "Expired"
			status: { $nin: ['Sold_Out', 'Expired'] },
		});

		if (!getListing) {
			if (modelData) {
				const getListing2 = await saveListingModal.findOne({
					userUniqueId: userUniqueId,
					marketingName: modelData.marketingName,
					deviceStorage: modelData.deviceStorage,
					deviceRam: modelData.deviceRam,
				});
				if (!getListing2) {
					res.status(200).json({
						reason: 'Invalid device id provided',
						statusCode: 200,
						status: 'INVALID',
						dataObject: {},
					});
					return;
				} else {
					res.status(200).json({
						reason: 'Listing found successfully',
						statusCode: 200,
						status: 'SUCCESS',
						dataObject: getListing2,
					});
				}
			} else {
				res.status(200).json({
					reason: 'Invalid device id provided',
					statusCode: 200,
					status: 'INVALID',
				});
				return;
			}
		} else {
			res.status(200).json({
				reason: 'Listing found successfully',
				statusCode: 200,
				status: 'SUCCESS',
				dataObject: getListing,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

module.exports = router;
