const express = require("express");
const router = express.Router();

// require("../../src/database/connection");
// const saveListingModal = require("../../src/database/connection");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const multer = require("multer");
const { uploadFile, getFileStream } = require("../../src/s3");


const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, "/uploads/");
  },
  filename: function (req, file, next) {
    next(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, next) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    next(null, true);
  } else {
    next(new Error("file type not supported"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

router.get("/uploadimage/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

router.post("/uploadimage", upload.single("file"), async (req, res) => {
  const file = req.file;
  console.log(file);
  const result = await uploadFile(file);
  await unlinkFile(file.path);
  console.log(result);
  res.send({ imagePath: `${result.Location}`, imageKey: `${result.Key}` });
}); 

module.exports = router;
