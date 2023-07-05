import favoriteModal from '@/database/modals/favorite/favorite_add';
import bestDealsModal from '@/database/modals/others/best_deals_models';
import logEvent from '@/middleware/event_logging';
import validUser from '@/middleware/valid_user';
import { neededKeysForDeals } from '@/utils/matrix_figures';
import { Request, Response } from 'express';
import express from 'express';

const router = express.Router();

require('@/database/connection');

router.post(
	'/add',
	validUser,
	logEvent,
	async (req: Request, res: Response) => {
		const listingId = req.body.listingId;
		const userUniqueId = req.body.userUniqueId;

		try {
			const getFavObject = await favoriteModal
				.findOne({
					userUniqueId: userUniqueId,
				})
				.lean();

			// To update a particular document, whether it is existing or not. You need to first get all the elements out of the array and push into another array. And then get the ID of that object and save it using "findByIdAndUpdate" ----> getFavObject._id,

			if (getFavObject) {
				//adding all the listing id to arr
				let arr = [...getFavObject.fav_listings];

				if (!arr.includes(listingId)) {
					arr.push(listingId);

					let listingArray = {
						fav_listings: arr,
					};
					const updateList = await favoriteModal.findByIdAndUpdate(
						getFavObject._id,
						listingArray,
						{
							new: true,
						}
					);
					return res.status(200).json({
						reason: 'Favorite listings updated successfully',
						statusCode: 200,
						status: 'SUCCESS',
						updateList,
					});
				} else {
					return res.status(200).json({
						reason: 'Listing already exists in your favorite list',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			} else {
				const data = {
					fav_listings: listingId,
					userUniqueId: userUniqueId,
				};

				const listing_data = new favoriteModal(data);
				const dataObject = await listing_data.save();

				return res.status(201).json({
					reason: 'Favorite listings created successfully',
					statusCode: 201,
					status: 'SUCCESS',
					dataObject,
				});
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

router.post(
	'/deactivate',
	validUser,
	logEvent,
	async (req: Request, res: Response) => {
		const listingId = req.query.listingId;
		const userUniqueId = req.query.userUniqueId;

		try {
			const getFavObject = await favoriteModal.findOne({
				userUniqueId: userUniqueId,
			});

			if (getFavObject) {
				let arr = [];
				arr = getFavObject.fav_listings;

				if (typeof listingId === 'string' && arr.includes(listingId)) {
					// arr.splice(arr.indexOf(listingId), 1);

					for (var i = arr.length - 1; i >= 0; i--) {
						if (arr[i] === listingId) {
							arr.splice(i, 1);
						}
					}

					let listingArray = {
						fav_listings: arr,
					};
					const updateList = await favoriteModal.findByIdAndUpdate(
						getFavObject._id,
						listingArray,
						{
							new: true,
						}
					);

					return res.status(200).json({
						reason: 'Favorite listing updated successfully',
						statusCode: 200,
						status: 'SUCCESS',
						updateList,
					});
				} else {
					return res.status(200).json({
						reason: 'Favorite listing already deactivated',
						statusCode: 200,
						status: 'SUCCESS',
					});
				}
			} else {
				return res.status(200).json({
					reason: 'Favorite listing does not exist',
					statusCode: 200,
					status: 'SUCCESS',
				});
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

router.post(
	'/fetch',
	validUser,
	logEvent,
	async (req: Request, res: Response) => {
		const userUniqueId = req.query.userUniqueId;

		try {
			// const getFavObject = await favoriteModal.findOne({
			//   userUniqueId,
			// });

			// find in mongo via fastest query
			let getFavObject = await favoriteModal.aggregate([
				{
					$match: {
						userUniqueId: userUniqueId,
					},
				},
				{
					$project: {
						_id: 0,
						fav_listings: 1,
					},
				},
			]);

			// let fav_list = getFavObject[0].fav_listings;

			// let dataObject = [];

			if (getFavObject && getFavObject[0]?.fav_listings.length > 0) {
				let arr = [];
				arr = getFavObject[0].fav_listings;

				if (arr.length > 0) {
					let allFavListings = await bestDealsModal
						.find(
							{
								isOtherVendor: 'N',
								status: ['Active', 'Sold_Out'],
								listingId: arr,
							},
							neededKeysForDeals
						)
						.lean();

					if (allFavListings.length > 0) {
						// dataObject = allFavListings;
						return res.status(200).json({
							reason: 'Favorite listings fetched successfully',
							statusCode: 200,
							status: 'SUCCESS',
							dataObject: allFavListings,
						});
					} else {
						// first remove the listingId from the fav_listings array
						// let deletingResp = await favoriteModal.findOneAndUpdate(
						//   { userUniqueId: userUniqueId },
						//   { $pull: { fav_listings: { $in: arr } } },
						//   { new: true }
						// );
						return res.status(200).json({
							reason: 'You do not have any favourite listing',
							statusCode: 200,
							status: 'SUCCESS',
							dataObject: [],
						});
					}
				} else {
					return res.status(200).json({
						reason: 'You do not have any favourite listing',
						statusCode: 200,
						status: 'SUCCESS',
						dataObject: [],
					});
				}
			} else {
				return res.status(200).json({
					reason: 'Favorite listing does not exist',
					statusCode: 200,
					status: 'SUCCESS',
					dataObject: [],
				});
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json(error);
		}
	}
);

export = router;
