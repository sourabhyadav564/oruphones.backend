import express, { Request } from 'express';
import '../../../database/connection';
import logEvent from '../../../middleware/event_logging';
import validUser from '../../../middleware/valid_user';
import { getFileStream, s3 } from '../../../s3_2';
import multer from 'multer';
import multerS3 from 'multer-s3-transform';
import sharp from 'sharp';

const bucketName = process.env.AWS_BUCKET_NAME;

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: (arg0: Error | null, arg1: boolean) => void
) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
	}
};

const options = {
	s3,
	bucket: bucketName,
	acl: 'public-read',
	cacheControl: 'max-age=31536000',
	limits: {
		fileSize: 5 * 1000 * 1000, // 5 MB
	},
	shouldTransform: function (req: Request, file: Express.Multer.File, cb: any) {
		cb(null, /^image/i.test(file.mimetype));
	},
	transforms: [
		{
			id: 'original',
			key: (req: Request, file: Express.Multer.File, cb: any) => {
				cb(null, 'image-original.webp');
			},
			transform: (req: Request, file: Express.Multer.File, cb: any) => {
				cb(null, sharp().resize(1200).webp());
			},
		},
		{
			id: 'thumbnail',
			key: (req: Request, file: Express.Multer.File, cb: any) => {
				cb(null, 'image-thumbnail.webp');
			},
			transform: (req: Request, file: Express.Multer.File, cb: any) => {
				cb(null, sharp().resize(200).webp());
			},
		},
	],
};

const router = express.Router();
const storage = multerS3(options);
const upload = multer({ fileFilter: fileFilter as any, storage });

router.get('/uploadimage/:key', (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

router.post(
	'/uploadimage',
	validUser,
	logEvent,
	upload.single('image'),
	(req, res, next) => {
		res
			.status(201)
			.json({ message: 'Image uploaded successfully', file: req.file });
	}
);

export default router;
