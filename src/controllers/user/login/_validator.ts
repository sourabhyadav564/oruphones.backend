import { z } from 'zod';

export default z.object({
	mobileNumber: z.number().int().gte(1000000000).lte(9999999999),
	countryCode: z.string(),
});

export const withOTP = z.object({
	mobileNumber: z.number().int().gte(1000000000).lte(9999999999),
	countryCode: z.string(),
	otp: z.number().gte(1000).lte(9999),
});
