const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { uploadFile, getFileStream } = require('../../../s3_2');
const isAuth = require('../../../middleware/is_Session');
const redis = require('../../../../config/redis');
const sharp = require('sharp');

const dirPath = __dirname.toString();

const storage = multer.memoryStorage(); // Store file buffer in memory instead of disk

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5 },
});

router.get('/uploadimage/:key', isAuth, (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

router.post(
	'/uploadimage',
	isAuth,
	upload.single('image'),
	async (req, res) => {
		try {
			const user = req.session.User;
			const userUniqueId = user.userUniqueId;

			// Check the upload count using Redis
			redis.get(userUniqueId, async (error, count) => {
				if (error) {
					console.error('Error retrieving upload count from Redis:', error);
					return res.status(500).json({ message: 'Internal Server Error' });
				}

				// Convert count to number and check if it exceeds the limit
				const uploadCount = parseInt(count) || 0;
				const uploadLimit = 10;
				const uploadLimitPeriod = 3600; // 1 hour in seconds

				if (uploadCount >= uploadLimit) {
					return res.status(429).json({
						message: 'Upload limit exceeded. Please try again after an hour.',
					});
				}
			

				const file = req.file;
				if (!file || !file.originalname.match(/\.(jpeg|jpg|png|heic|heif|tiff|eps|gif|svg)$/i)) {
					return res.status(400).json({
					  message: 'File type not supported. Only JPEG, JPG, PNG, HEIC, and HEIF files are allowed.',
					});
				  }
				  
				const fileName = file?.originalname
					? file?.originalname.split('.')[0]
					: '';

					

				const thumbnailBuffer = await sharp(file.buffer)
					.resize(600, 300)
					.toBuffer();

				// Upload the file buffer to S3
				const originalImageResult = await uploadFile({
					buffer: file.buffer,
					originalname: `${fileName}.webp`,
					mimetype: 'image/webp',
				});

				// Upload the thumbnail image buffer to S3
				const thumbnailResult = await uploadFile({
					buffer: thumbnailBuffer,
					originalname: `${fileName}_thumbnail.webp`,
					mimetype: 'image/webp',
				});

				const dataObject = {
					imagePath: `${originalImageResult.Location}`,
					thumbnailImagePath: `${thumbnailResult.Location}`, // Include the thumbnail URL in the response
					imageKey: `${originalImageResult.Key}`,
				};

				res.status(200).json({
					reason: 'Image uploaded successfully',
					statusCode: 201,
					status: 'SUCCESS',
					dataObject,
				});

				// Increase the upload count in Redis or initialize it if it doesn't exist
				if (uploadCount === 0) {
					// Set an initial value for the upload count
					redis.set(userUniqueId, 1, 'EX', uploadLimitPeriod, (error) => {
						if (error) {
							console.error('Error initializing upload count in Redis:', error);
						}
					});
				} else {
					// Increment the upload count in Redis
					redis.incr(userUniqueId, (error) => {
						if (error) {
							console.error('Error incrementing upload count in Redis:', error);
						} else {
							// Set the expiration time for the upload count key
							redis.expire(userUniqueId, uploadLimitPeriod);
						}
					});
				}
			});
		} catch (error) {
			console.log(error);
			res
				.status(400)
				.json({ reason: error.message, statusCode: 400, status: 'FAILED' });
		}
	}
);

module.exports = router;
