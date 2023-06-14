const express = require('express');
const router = express.Router();
const { spawn } = require('node:child_process');
require('../../../database/connection');
const logEvent = require('../../../middleware/event_logging');
const fs = require('fs');
const multer = require('multer');
const { uploadFile, getFileStream } = require('../../../s3');
const validUser = require('../../../middleware/valid_user');
const redis = require('../../../../config/redis');

const dirPath = __dirname.toString();

const storage = multer.diskStorage({
	destination: function (req, file, next) {
		next(null, dirPath);
	},
	filename: function (req, file, next) {
		next(null, Date.now().toString() + '-' + file.originalname);
	},
});

const fileFilter = (req, file, next) => {
	if (
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/webp'
	) {
		next(null, true);
	} else {
		next(new Error('File type not supported'), false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
	// fileFilter: fileFilter,
});

router.get('/uploadimage/:key', (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

router.post(
	'/uploadimage',
	upload.single('image'),
	validUser,
	logEvent,
	async (req, res) => {
		const file = req.file;

		if (
			!file ||
			!file.originalname.match(/\.(jpeg|jpg|png|heic|heif|tiff|eps|svg)$/i)
		) {
			return res.status(400).json({
				message:
					'File type not supported. Only JPEG, JPG, PNG, HEIC, TIFF, EPS ,SVG and HEIF files are allowed.',
			});
		}

		let fileName = file?.filename ? file?.filename.split('.')[0] : '';

		let origPath = `${dirPath}/${fileName}_org.webp`;
		let tempPath = `${dirPath}/${fileName}.webp`;
		let pathLength = req.file?.path.toString().split('/');
		console.log(
			'1',
			pathLength.length,
			`${dirPath.toString().split('dist')[0]}src/routes/v1/device/` +
				`image_handler.py`,
			// `${dirPath.toString()}` +
			req.file?.path.toString().split('/')[pathLength.length - 1]
		);
		const pyProg = spawn('python', [
			`${dirPath.toString().split('dist')[0]}src/routes/v1/device/` +
				`image_handler.py`,
			// `${dirPath.toString()}/` +
			req.file?.path.toString().split('/')[pathLength.length - 1],
		]);

		pyProg.stdout.on('data', async (data) => {
			let origFile = {
				path: origPath,
				filename: `${fileName}_org.webp`,
				mimetype: 'image/webp',
			};

			let thumb = {
				path: tempPath,
				filename: `${fileName}.webp`,
				mimetype: 'image/webp',
				isThumbnail: true,
			};

			const [result, result2] = await Promise.all([
				uploadFile(origFile),
				uploadFile(thumb),
			]);
			await Promise.all([
				fs.promises.unlink(origPath),
				fs.promises.unlink(tempPath),
			]);

			const dataObject = {
				imagePath: `${result.Location}`,
				thumbnailImagePath: `${result2.Location}`,
				imageKey: `${result.Key}`,
			};

			res.status(200).json({
				reason: 'Image uploaded successfully',
				statusCode: 201,
				status: 'SUCCESS',
				dataObject,
			});
		});

		pyProg.stderr.on('data', (data) => {
			console.error(`error: ${data}`);
		});
	}
);

module.exports = router;
