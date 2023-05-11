require('dotenv').config();
const fs = require('fs');
const { Upload } = require('@aws-sdk/lib-storage'),
	{ S3 } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
	region,
	accessKeyId,
	secretAccessKey,
});

// uploads a file to s3
function uploadFile(file) {
	const fileStream = fs.createReadStream(file.path);

	const uploadParams = {
		Bucket: bucketName,
		Body: fileStream,
		Key: file.filename,
	};

	return new Upload({
		client: s3,
		params: uploadParams,
	}).done();
}

exports.uploadFile = uploadFile;

// downloads a file from s3
function getFileStream(fileKey) {
	const downloadParams = {
		Key: fileKey,
		Bucket: bucketName,
	};

	return s3.getObject(downloadParams).createReadStream();
}

exports.getFileStream = getFileStream;
