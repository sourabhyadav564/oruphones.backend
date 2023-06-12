import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';

require('dotenv').config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

export const s3 = new S3({
	region,
	accessKeyId,
	secretAccessKey,
});

// uploads a file to s3
function uploadFile(file: Express.Multer.File) {
	const fileStream = fs.createReadStream(file.path);

	const uploadParams = {
		Bucket: bucketName,
		Body: fileStream,
		Key: file.filename,
	};

	return s3.upload(uploadParams as any).promise();
}

export { uploadFile };

// downloads a file from s3
function getFileStream(fileKey: any) {
	const downloadParams = {
		Key: fileKey,
		Bucket: bucketName,
	};

	return s3.getObject(downloadParams as any).createReadStream();
}
export { getFileStream };
