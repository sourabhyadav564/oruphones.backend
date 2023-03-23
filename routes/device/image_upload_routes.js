const express = require("express");
const router = express.Router();
const sharp = require("sharp");

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
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/webp"
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
      let fileName = file?.filename ? file?.filename.split(".")[0] : "";

      // get the actual height and width of the image
      let ch = 100;
      let cw = 80;
      const { width, height } = await sharp(
        req.file?.path.toString()
      ).metadata();
      if (height >= 3000 || width >= 3000) {
        ch = height * 0.03;
        cw = width * 0.03;
      } else if (height >= 2000 || width >= 2000) {
        ch = height * 0.05;
        cw = width * 0.05;
      } else if (height >= 1000 || width >= 1000) {
        ch = height * 0.1;
        cw = width * 0.1;
      } else if (height > 600 || width > 600) {
        ch = height * 0.3;
        cw = width * 0.3;
      } else if (height > 300 || width > 300) {
        ch = height * 0.5;
        cw = width * 0.5;
      } else if (height > 200 || width > 200) {
        ch = height * 0.7;
        cw = width * 0.7;
      } else if (height > 100 || width > 100) {
        ch = height * 0.9;
        cw = width * 0.9;
      } else if (height >= 0 || width >= 0) {
        ch = height;
        cw = width;
      }

      ch = parseInt(ch);
      cw = parseInt(cw);

      let origPath = `routes/device/${fileName}_org.webp`;
      let tempPath = `routes/device/${fileName}.webp`;
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
                mimetype: "image/webp",
              };

              let thumb = {
                path: tempPath,
                filename: `${fileName}.webp`,
                mimetype: "image/webp",
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
                reason: "Image uploaded successfully",
                statusCode: 201,
                status: "SUCCESS",
                dataObject,
              });
            });
        }
      );
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json({ reason: error.message, statusCode: 400, status: "FAILED" });
    }
  }
);

module.exports = router;
