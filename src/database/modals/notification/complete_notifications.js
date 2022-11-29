const mongoose = require("mongoose");
const validator = require("validator");
// const moment = require("moment");
// const bcrypt = require("bcryptjs");
// const makeRandomString = require("../../../../utils/generate_random_string");

// const now = new Date();
// const currentDate = moment(now).format("L");

const notificationSchema = new mongoose.Schema(
  {
    userUniqueId: {
      type: String,
      required: true,
    },
    notification: {
      type: [
        {
          notificationId: {
            type: String,
            // required: true,
          },
          isUnRead: {
            type: Number,
            // required: true,
            default: 0,
          },
          createdDate: {
            type: String,
            // required: true,
          },
          appEventAction: {
            type: String,
            // required: true,
          },
          webEventAction: {
            type: String,
            // required: true,
          },
          messageContent: {
            type: String,
            // required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

const notificationModel = new mongoose.model(
  "complete_notifications",
  notificationSchema
);

module.exports = notificationModel;
