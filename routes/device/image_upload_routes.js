const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const imageUploadModal = require("../../src/database/modals/device/image_upload");
const logEvent = require("../../src/middleware/event_logging");

const fs = require("fs");
// const resizeImg = require("resize-img");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const { uploadFile, getFileStream } = require("../../src/s3");
const validUser = require("../../src/middleware/valid_user");
// const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, __dirname);
  },
  filename: function (req, file, next) {
    next(null, Date.now().toString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, next) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    next(null, true);
  } else {
    next(new Error("File type not supported"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  // fileFilter: fileFilter,
});

router.get("/uploadimage/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

router.post(
  "/uploadimage",
  upload.single("image"),
  validUser,
  logEvent,
  async (req, res) => {
    try {
      const file = req.file;
      const result = await uploadFile(file);
      await unlinkFile(file?.path);

      const dataObject = {
        imagePath: `${result.Location}`,
        thumbnailImagePath: `${result.Location}`,
        imageKey: `${result.Key}`,
      };

      res.status(200).json({
        reason: "Image uploaded successfully",
        statusCode: 201,
        status: "SUCCESS",
        dataObject,
      });

      // make & uploading thumbnail image
      // const { buffer, originalname } = req.file;
      // const timestamp = new Date().toISOString();
      // const ref = `${timestamp}-${originalname}.webp`;
      // // const thumbnail = await sharp(buffer)
      // //   .webp({ quality: 10 })
      // //   .toFile("thumb_" + ref);
      // const thumbnail = sharp(req.file).resize(1000).jpeg({ quality: 10 });
      // const thumbnailResult = await uploadFile(thumbnail);

      // const buf = await resizeImg(req.file, {
      //   width: 250,
      //   height: 250,
      // });
      // var file_path = req.file.path;
      // fs.readFile(file_path, async function (err, data) {
      //   const buf = await resizeImg(data, {
      //     width: 50,
      //     height: 70,
      //   });
      //   fs.writeFile(file_path, buf, function (err) {
      //     res.end(
      //       JSON.stringify({
      //         message: "file uploaded successfully",
      //         success: true,
      //       })
      //     );
      //   });
      //   const result2 = await uploadFile(buf);
      //   await unlinkFile(file?.path);

      //   const file = req.file;
      //   const result = await uploadFile(file);
      //   await unlinkFile(file?.path);

      //   const dataObject = {
      //     imagePath: `${result.Location}`,
      //     // thumbnailImagePath: `${result.Location}`,
      //     // thumbnailImagePath: `${thumbnailResult.Location}`,
      //     result2: `${result2.Location}`,
      //     imageKey: `${result.Key}`,
      //   };

      //   res.status(200).json({
      //     reason: "Image uploaded successfully",
      //     statusCode: 201,
      //     status: "SUCCESS",
      //     dataObject,
      //   });
      // });

      // const imageInfo ={
      //   deviceFace: req.query.deviceFace,
      //   deviceStorage: req.query.deviceStorage,
      //   make: req.query.make,
      //   model: req.query.model,
      //   userUniqueId: req.query.userUniqueId,
      //   imagePath: result.Location
      // }

      // const saveData = new imageUploadModal(imageInfo);

      // //TODO: for future use
      // const createdObject = await saveData.save();
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

module.exports = router;
