const mongoose = require("mongoose");
const validator = require("validator");

const reportSchema = new mongoose.Schema(
  {
    filePath: {
      type: String,
    },
    fileKey: {
      type: String,
    },
    hasLog: {
      type: Boolean,
      required: true,
    },
    issueType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      //   required: true,
    },
    phone: {
      type: String,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    forCrash: {
      type: Boolean,
      // required: true,
    },
    shareLog: {
      type: Boolean,
      // required: true,
    },
    scheduleCall: {
      type: Boolean,
      // required: true,
    },
  },
  { timestamps: true }
);

const reportModal = new mongoose.model("report_issues", reportSchema);

module.exports = reportModal;
