require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads an image to s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);
  let additionalPath = file.isThumbnail ? "/thumbnails" : "/originals";

  const uploadParams = {
    Bucket: bucketName + additionalPath,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

// uploads a file to s3
function uploadLogFile(file, fName, forCrash, isReport) {
  const fileStream = fs.createReadStream(file.path);
  let monthName = new Date().toLocaleString("default", { month: "long" });
  let year = new Date().getFullYear();
  let date = new Date().getDate();
  let dir = forCrash ? "/crash" : "/logs";
  let initPath = isReport ? "/reports/" : "/logs/";
  dir = isReport ? "" : dir;
  const uploadParams = {
    Bucket: bucketName + initPath + year + "/" + monthName + "/" + date + dir,
    Body: fileStream,
    // Key: file.filename,
    Key: fName,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

exports.uploadLogFile = uploadLogFile;

// downloads a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

exports.getFileStream = getFileStream;
