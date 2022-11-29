const mongoose = require("mongoose");
const validator = require("validator");

const eventSchema = new mongoose.Schema(
  {
    userUniqueId: {
      type: String || Number,
      default: "Guest",
    },
    events: {
      type: [{
          eventName: {
            type: String,
            default: "SESSION_CREATED",
          },
        }],
      default: [{
        eventName: "SESSION_CREATED",
      }],
      // required: true,
    },
    srcFrom: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String || Number,
      // required: true,
    },
    accessToken: {
      type: String,
      // required: true,
    },
    refreshToken: {
      type: String,
      // required: true,
    },
    location: {
      type: String,
      // required: true,
    },
    devicePlatform: {
      type: String,
      // required: true,
    }
  },
  { timestamps: true }
);

eventSchema.pre("save", async function (next) {
  this.sessionId = this._id;
  next();
});

const eventModal = new mongoose.model("event_loggings", eventSchema);

module.exports = eventModal;
