const express = require("express");
const router = express.Router();

require("../../src/database/connection");
const imageUploadModal = require("../../src/database/modals/device/image_upload");
const logEvent = require("../../src/middleware/event_logging");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const { uploadFile, getFileStream } = require("../../src/s3");

const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, "./uploads/");
  },
  filename: function (req, file, next) {
    next(null, Date.now() + "-" + file.originalname);
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

router.get("/uploadimage/:key", logEvent, (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

router.post("/uploadimage", logEvent, upload.single("image"), async (req, res) => {

  try {
    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file?.path);

    const imageInfo ={
      deviceFace: req.query.deviceFace,
      deviceStorage: req.query.deviceStorage,
      make: req.query.make,
      model: req.query.model,
      userUniqueId: req.query.userUniqueId,
      imagePath: result.Location
    }

    const saveData = new imageUploadModal(imageInfo);

    //TODO: for future use
    const createdObject = await saveData.save();

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
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
