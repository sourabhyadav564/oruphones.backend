import RequestModel from '@/database/modals/device/request_verification_save';
import ListingModel from '@/database/modals/device/save_listing_device';
import ShortLinkModal from '@/database/modals/others/short_link_model';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { generate } from 'short-uuid';
import { z } from 'zod';

const validator = z.object({
	listingId: z.string(),
});

async function sendSMS(mobileNumber: number, listingId: string) {
	try {
		// Create short link for the listing
		const apiKey = process.env.TEXTLOCAL_API_KEY;
		const sender = 'ORUPHN';
		const listing = await ListingModel.findOne({ listingId });
		if (!listing) {
			throw new Error('Listing not found');
		}
		const slug = generate();
		const fullLink = `${process.env.CLIENT_URL}/${listing?.make}/${listing?.model}/${listing?.listingId}`;
		const shortLink = `${process.env.CLIENT_URL}/${slug}`;
		// generate short link
		await ShortLinkModal.create({
			unKey: slug,
			linkStr: fullLink,
		});
		const message = `Hey ${listing?.listedBy}, You recently created an ad to sell your ${listing?.model}on an online marketplace. We at ORUphones have listed your phone for FREE. Please verify your listing once to sell quickly. Do follow the link for the verification process: ${shortLink}`;
		const numbers = `91${mobileNumber}`;
		const url = `https://api.textlocal.in/send/?apiKey=${apiKey}&sender=${sender}&message=${message}&numbers=${numbers}`;
		const response = await fetch(url);
		// send OTP using textlocal API
		const data = await response.json();
		console.log(data);
		if (data.status !== 'success') {
			throw new Error('OTP could not be sent');
		}
	} catch (err) {
		throw err;
	}
}
export default async function sendVerification(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { listingId } = validator.parse(req.body);
		if (req.session.user!.userListings!.includes(listingId)) {
			// return cannot request verification for own listing
			res.status(400).json({
				status: 'error',
				reason: 'Cannot request verification for own listing',
			});
		}
		let requestedVerification = await RequestModel.findOne({
			userUniqueId: req.session.user?.userUniqueId,
			listingId,
		});
		if (requestedVerification) {
			// return already requested
			res.status(400).json({
				status: 'error',
				reason: 'Already requested',
			});
		}
		requestedVerification = new RequestModel({
			userUniqueId: req.session.user?.userUniqueId,
			listingId,
			mobileNumber: req.session.user?.mobileNumber,
		});
		await requestedVerification.save();
		// send OTP
		await sendSMS(parseInt(req.session.user!.mobileNumber!), listingId);
	} catch (e) {
		next(e);
	}
}
