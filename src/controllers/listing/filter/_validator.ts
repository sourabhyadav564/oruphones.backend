import { z } from 'zod';

export default z.object({
	filter: z.object({
		listingId: z.string().min(1).max(32).optional(),
		page: z.number().min(1).max(100).optional(),
		make: z.string().min(1).max(100).array().optional(),
		model: z.string().min(1).max(100).array().optional(),
		condition: z.string().min(1).max(100).array().optional(),
		storage: z.string().min(1).max(100).array().optional(),
		warranty: z.string().min(1).max(100).array().optional(),
		verified: z.boolean().optional(),
		ram: z.string().min(1).max(100).array().optional(),
		priceRange: z.number().min(0).max(999999).nullable().array().optional(),
		listingLocation: z.string().min(1).max(100).optional(),
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
		limit: z.number().min(1).max(100).optional(),
		includeSelf: z.boolean().optional(),
		notionalIDs: z.string().min(1).max(100).array().optional(),
		sort: z
			.object({
				price: z.number().min(-1).max(1).optional(),
				date: z.number().min(-1).max(1).optional(),
				latlong: z.number().min(-1).max(1).optional(),
			})
			.optional(),
	}),
	returnFilter: z
		.object({
			listingId: z.number().min(0).max(1).optional(),
			deviceCondition: z.number().min(0).max(1).optional(),
			defaultImage: z.number().min(0).max(1).optional(),
			listingLocation: z.number().min(0).max(1).optional(),
			listingPrice: z.number().min(0).max(1).optional(),
			marketingName: z.number().min(0).max(1).optional(),
			model: z.number().min(0).max(1).optional(),
			make: z.number().min(0).max(1).optional(),
			listingDate: z.number().min(0).max(1).optional(),
			listedBy: z.number().min(0).max(1).optional(),
			images: z.number().min(0).max(1).optional(),
			imagePath: z.number().min(0).max(1).optional(),
			deviceStorage: z.number().min(0).max(1).optional(),
			charger: z.number().min(0).max(1).optional(),
			earphone: z.number().min(0).max(1).optional(),
			originalbox: z.number().min(0).max(1).optional(),
			deviceRam: z.number().min(0).max(1).optional(),
			functionalTestResults: z.number().min(0).max(1).optional(),
			notionalPercentage: z.number().min(0).max(1).optional(),
			warranty: z.number().min(0).max(1).optional(),
			cosmetic: z.number().min(0).max(1).optional(),
			verified: z.number().min(0).max(1).optional(),
			verifiedDate: z.number().min(0).max(1).optional(),
			isOtherVendor: z.number().min(0).max(1).optional(),
			status: z.number().min(0).max(1).optional(),
		})
		.optional(),
});
