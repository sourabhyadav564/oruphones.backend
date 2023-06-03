const mongoose = require("mongoose");
const validator = require("validator");

const imageMapSchema = new mongoose.Schema(
  {
    originalId: {
      type: String,
      required: true,
    },
    listingId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const imageMapModal = new mongoose.model("a_mapped_images", imageMapSchema);

module.exports = imageMapModal;