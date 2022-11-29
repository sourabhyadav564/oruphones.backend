const mongoose = require("mongoose");
const validator = require("validator");

const defaultImageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    brand_id: {
      type: String,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const defaultImageModal = new mongoose.model(
  "model_default_images",
  defaultImageSchema
);

module.exports = defaultImageModal;
