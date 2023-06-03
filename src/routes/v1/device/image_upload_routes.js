const express = require('express');
const router = express.Router();
const sharp = require('sharp');

const imageUploadModal = require('../../../database/modals/device/image_upload');
const logEvent = require('../../../middleware/event_logging');

const fs = require('fs');
// const resizeImg = require("resize-img");
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

const multer = require('multer');
const { uploadFile, getFileStream } = require('../../../s3');
const validUser = require('../../../middleware/valid_user');
// const sharp = require("sharp");

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
		try {
			const file = req.file;
			let fileName = file?.filename ? file?.filename.split('.')[0] : '';
			// sendMail("uploadimage", file?.filename ? file?.filename : "no file");

			// get the actual height and width of the image
			let ch = 150;
			let cw = 80;
			let { width, height } = await sharp(req.file?.path.toString()).metadata();

			let ratio = height / width;

			height = 300;
			width = height / ratio;

			ch = parseInt(height);
			cw = parseInt(width);

			let origPath = dirPath + `/${fileName}_org.webp`;
			let tempPath = dirPath + `/${fileName}.webp`;
			let result = {};
			let result2 = {};
			await sharp(req.file?.path.toString()).toFile(
				origPath,
				async (err, info) => {
					await sharp(req.file?.path.toString())
						.resize(cw, ch)
						.toFile(tempPath, async (err, info) => {
							// })
							// .then(async () => {

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

							result = await uploadFile(origFile);
							result2 = await uploadFile(thumb);

							await unlinkFile(origFile?.path);
							await unlinkFile(thumb?.path);
							await unlinkFile(file?.path);

							const dataObject = {
								imagePath: `${result.Location}`,
								thumbnailImagePath: `${result2.Location || result.Location}`,
								imageKey: `${result.Key}`,
							};

							res.status(200).json({
								reason: 'Image uploaded successfully',
								statusCode: 201,
								status: 'SUCCESS',
								dataObject,
							});
						});
				}
			);
		} catch (error) {
			console.log(error);
			res
				.status(400)
				.json({ reason: error.message, statusCode: 400, status: 'FAILED' });
		}
	}
);

module.exports = router;
