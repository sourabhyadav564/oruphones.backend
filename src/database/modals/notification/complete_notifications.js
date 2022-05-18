const mongoose = require("mongoose");
const validator = require("validator");
const moment = require("moment");

const now = new Date();
const currentDate = moment(now).format('L');

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
            default: currentDate,
          },
          appEventAction: {
            type: String,
            required: true,
          },
          messageContent: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

notificationSchema.pre("save", async function (next) {
  this.notification[0].notificationId = this.notification[0]._id;
  next();
});

const notificationModel = new mongoose.model(
  "complete_notifications",
  notificationSchema
);

module.exports = notificationModel;
