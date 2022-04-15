const mongoose = require("mongoose");
const validator = require("validator");

const eventSchema = new mongoose.Schema(
  {
    userUniqueId: {
      type: String || Number,
      default: "Guest"
    },
    events: {
      type: [
        {
          type: String,
          default: "NA"
        },
      ],
      required: true,
    },
    srcFrom: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String || Number,
        required: true,
    }
  },
  { timestamps: true }
);

eventSchema.pre('save', async function (next) {
  this.sessionId = this._id;
  next();
});


const eventModal = new mongoose.model("event_loggings", eventSchema);

module.exports = eventModal;
