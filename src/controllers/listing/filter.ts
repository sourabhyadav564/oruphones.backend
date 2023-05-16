import { Request, Response } from 'express';
import Listings from '@/database/modals/others/best_deals_models';
import { z } from 'zod';

const validator = z.object({
	filter: z.object({
		page: z.number().min(1).max(100).optional(),
		make: z.string().min(1).max(100).array().optional(),
		model: z.string().min(1).max(100).array().optional(),
		condition: z.string().min(1).max(100).array().optional(),
		storage: z.string().min(1).max(100).array().optional(),
		warranty: z.string().min(1).max(100).array().optional(),
		verified: z.boolean().optional(),
		priceRange: z.number().min(1).max(100).array().optional(),
		listingLocation: z.string().min(1).max(100).optional(),
		limit: z.number().min(1).max(100).optional(),
	}),
	returnFilter: z
		.object({
			_id: z.string().min(1).max(100).optional(),
			deviceCondition: z.string().min(1).max(100).optional(),
			defaultImage: z.string().min(1).max(100).optional(),
			listingLocation: z.string().min(1).max(100).optional(),
			listingPrice: z.number().min(1).max(100).optional(),
			marketingName: z.string().min(1).max(100).optional(),
			model: z.string().min(1).max(100).optional(),
			listingDate: z.string().min(1).max(100).optional(),
			listedBy: z.string().min(1).max(100).optional(),
		})
		.optional(),
});

const countValidator = z.object({
	make: z.string().min(1).max(100).array().optional(),
	model: z.string().min(1).max(100).array().optional(),
	condition: z.string().min(1).max(100).array().optional(),
	storage: z.string().min(1).max(100).array().optional(),
	warranty: z.string().min(1).max(100).array().optional(),
	verified: z.boolean().optional(),
	priceRange: z.number().min(1).max(100).array().optional(),
	listingLocation: z.string().min(1).max(100).optional(),
});

// TODO:Implement Sorting filter
// TODO: Fix price logic
async function filter(req: Request, res: Response) {
	try {
		const { filter, returnFilter } = validator.parse(req.body);
		const {
			make,
			model,
			condition,
			storage,
			warranty,
			verified,
			priceRange,
			listingLocation,
		} = filter;
		const filterObj = {
			// ...(make && { make }),
			// ...(model && { model }),
			// ...(condition && { deviceCondition: condition }), these are arrays
			// ...(storage && { deviceStorage: storage }),
			...(make && { make: { $in: make } }),
			...(model && { model: { $in: model } }),
			...(condition && { deviceCondition: { $in: condition } }),
			...(storage && { deviceStorage: { $in: storage } }),
			...(priceRange && {
				listingPrice: { $gte: +priceRange[0], $lte: +priceRange[1] },
			}),
			...(listingLocation === 'India' ? {} : { listingLocation }),
			// ...(warranty && { isOtherVendor: !!warranty }),
			...(verified && { verified }),
		};

		//optional return filter lets us choose what we want to return
		let returnFilterObj = {};
		if (returnFilter) {
			const {
				_id,
				deviceCondition,
				defaultImage,
				listingLocation,
				listingPrice,
				marketingName,
				model,
				listingDate,
				listedBy,
			} = returnFilter;
			returnFilterObj = {
				...(_id && { _id }),
				...(deviceCondition && { deviceCondition }),
				...(defaultImage && { defaultImage }),
				...(listingLocation && { listingLocation }),
				...(listingPrice && { listingPrice }),
				...(marketingName && { marketingName }),
				...(model && { model }),
				...(listingDate && { listingDate }),
				...(listedBy && { listedBy }),
			};
		} else {
			returnFilterObj = {
				_id: 1,
				deviceCondition: 1,
				defaultImage: 1,
				listingLocation: 1,
				listingPrice: 1,
				marketingName: 1,
				model: 1,
				listingDate: 1,
				listedBy: 1,
			};
		}
		//calculate pagination
		const page = req.body.filter.page || 1;
		const limit = req.body.filter.limit || 20;
		const skip = (page - 1) * limit;

		// Get the total documents
		const bestDeals = await Listings.find(filterObj)
			.skip(skip)
			.limit(limit)
			.select(returnFilterObj);
		res.status(200).json({ data: bestDeals });
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error: error.issues });
		} else if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(400).json({ error: error });
		}
	}
}

async function filterCount(req: Request, res: Response) {
	try {
		const {
			make,
			model,
			condition,
			storage,
			warranty,
			verified,
			priceRange,
			listingLocation,
		} = countValidator.parse(req.body);
		const filterObj = {
			...(make && { make: { $in: make } }),
			...(model && { model: { $in: model } }),
			...(condition && { deviceCondition: { $in: condition } }),
			...(storage && { deviceStorage: { $in: storage } }),
			...(priceRange && {
				listingPrice: { $gte: priceRange[0], $lte: priceRange[1] },
			}),
			...(warranty && { isOtherVendor: !!warranty }),
			...(verified && { verified }),
			...(listingLocation === 'India' ? {} : { listingLocation }),
		};
		const count = await Listings.countDocuments(filterObj);
		res.status(200).json({ count });
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error: error.issues });
		} else if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(400).json({ error: error });
		}
	}
}

export default {
	filter,
	filterCount,
};
