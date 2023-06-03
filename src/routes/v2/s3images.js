const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();


const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.AWS_BUCKET_NAME;

const region = process.env.AWS_BUCKET_REGION;

const accessKeyId = process.env.AWS_ACCESS_KEY;

const secretAccessKey = process.env.AWS_SECRET_KEY;

console.log(region,accessKeyId,secretAccessKey)

const s3 = new S3({
	region,

	accessKeyId,

	secretAccessKey,
});

router.get('/get', (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: 'images/' 
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving images');
    }


    const imageUrls = data.Contents.map(obj => {
      return `https://${params.Bucket}.s3.amazonaws.com/${obj.Key}`;
    });

    res.json(imageUrls);
  });
});

module.exports = router