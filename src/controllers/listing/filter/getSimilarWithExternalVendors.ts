import { VENDORS } from './_constants';
import validator from './_validator';
import Listings from '@/database/modals/others/best_deals_models';
import rankedListings from '@/database/modals/others/test_scrapped_models';
import { Request, Response, NextFunction } from 'express';


async function getSimilarWithExternalVendors(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		let { filter } = validator.parse(req.body);
		const listing = await Listings.findOne({
			listingId: filter.listingId,
		});
		if (!listing) throw new Error('Listing not found');
		let filterObj = {
			status: 'Active',
			notionalPercentage: {
				$exists: true,
				$type: 'number',
				$gt: 0,
				$lt: 40,
			},
			...(listing.make && { make: listing.make }),
			...(listing.model && { model: listing.model }),
			...(listing.deviceCondition && {
				deviceCondition: listing.deviceCondition,
			}),
			...(listing.deviceStorage && { deviceStorage: listing.deviceStorage }),
			...(listing.make!=='Apple' && listing.deviceRam && { deviceRam: listing.deviceRam }),
		};
		let rankedFilterObj = {
			model_name: {
				$regex: new RegExp(
					'^' + listing?.marketingName?.toLowerCase() + '$',
					'i'
				),
			},
			storage: parseInt(listing?.deviceStorage!.replace('GB', '').trim()),
			type: ['buy', 'Buy'],
			mobiru_condition: listing?.deviceCondition,
			// isOtherVendor: "Y",
		};
		let returnFilter = {
			listingId: 1,
			deviceCondition: 1,
			defaultImage: 1,
			listingLocation: 1,
			listingState: 1,
			listingPrice: 1,
			marketingName: 1,
			model: 1,
			listingDate: 1,
			listedBy: 1,
			verified: 1,
			deviceStorage: 1,
			charger: 1,
			earphone: 1,
			originalbox: 1,
			deviceRam: 1,
			functionalTestResults: 1,
			notionalPercentage: 1,
			warranty: 1,
			cosmetic: 1,
			isOtherVendor: 1,
			make: 1,
			listingLocality : 1
		};
		// Find top 3 bestDeals
		let bestDeals6 = await Listings.find(filterObj)
			.limit(3)
			.select(returnFilter)
			.lean();

		// Finding all rankedListings with same model name and storage
		let rankedBestDeals = await rankedListings.find(rankedFilterObj).lean();

		// Find next 3 bestDeals such that they exists in rankedListings
		let bestDeals3 = await Listings.find({
			isOtherVendor: 'Y',
			// listingId not in bestDeals6 but in rankedBestDeals
			listingId: {
				$in: rankedBestDeals.map((rankedBestDeal) => rankedBestDeal.listingId),
				$nin: bestDeals6.map((bestDeal) => bestDeal.listingId),
			},
		})
			.limit(3)
			.select(returnFilter)
			.lean();
		// Append bestDeals3 to bestDeals6
		bestDeals6 = [...bestDeals6, ...bestDeals3];

		// Find vendor_id of bestDeals6 where isOtherVendor is Y
		let listingsWhereIsOtherVendorIsY = bestDeals6
			.filter((bestDeal) => bestDeal.isOtherVendor === 'Y')
			.map((bestDeal) => bestDeal.listingId);

		let vendorDetails = await rankedListings
			.find({
				listingId: {
					$in: listingsWhereIsOtherVendorIsY,
				},
			})
			.select({
				listingId: 1,
				vendor_id: 1,
				link: 1,
			})
			.lean();

		// Append vendor details to bestDeals6
		let bestDeals6Mapped = bestDeals6.map((bestDeal) => {
			if (bestDeal.isOtherVendor === 'N') {
				return {
					...bestDeal,
					vendorName: 'Oru',
					vendorImage: `https://d1tl44nezj10jx.cloudfront.net/devImg/vendors/oru_logo.png`,
					vendorLink: `/product/buy-old-refurbished-used-mobiles/${bestDeal.make}/${bestDeal.model}/${bestDeal.listingId}`,
				};
			}
			let vendorEntry = vendorDetails.find(
				(vendorDetail) => vendorDetail.listingId === bestDeal.listingId
			);
			let vendorName = vendorEntry?.vendor_id!
				? VENDORS[vendorEntry?.vendor_id!]
				: '';
			let vendorLink = vendorEntry?.link!;
			return {
				...bestDeal,
				vendorName,
				vendorLink,
				vendorImage: `https://d1tl44nezj10jx.cloudfront.net/devImg/vendors/${vendorName
					.toString()
					.toLowerCase()}_logo.png`,
			};
		});
		// Remove entries with duplicate vendorNames
		bestDeals6Mapped = bestDeals6Mapped.filter((bestDeal, index, self) => {
			if (bestDeal.vendorName === 'Oru') return true;
			return (
				index === self.findIndex((t) => t.vendorName === bestDeal.vendorName)
			);
		});
		res.json({ data: bestDeals6Mapped });
	} catch (err) {
		next(err);
	}
}

export default getSimilarWithExternalVendors;