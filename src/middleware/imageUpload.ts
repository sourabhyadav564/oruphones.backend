import upload, { singleUpload } from '@/utils/upload_image';
import { NextFunction, Request, Response } from 'express';

export default async function imageUpload(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { query } = req;
		switch (query.type) {
			case 'listingImage': {
				upload.single('image')(req, res, next);
			}
      break;
			case 'profilePic':
			default: {
				// use singleUpload middleware to upload single image
				singleUpload.single('image')(req, res, next);
			}
		}
	} catch (err) {
		next(err);
	}
}
