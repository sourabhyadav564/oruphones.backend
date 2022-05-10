const mongoose = require("mongoose");
const validator = require("validator");

const scrappedSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      // required: true,
    },
    created_at: {
      type: String,
      // required: true,
    },
    updated_at: {
      type: String,
      // required: true,
    },
    storage: {
      type: Number,
      // required: true,
    },
    ram: {
      type: Number,
      // required: true,
    },
    color: {
      type: String,
      // required: true,
    },
    warranty: {
      type: String,
      // required: true,
    },
    condition: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    rating: {
      type: Number,
      // required: true,
    },
    max_rating: {
      type: Number,
      // required: true,
    },
    other_details: {
      type: String,
      // required: true,
    },
    model_id: {
      type: Number,
      // required: true,
    },
    vendor_id: {
      type: Number,
      // required: true,
    },
    heading: {
      type: String,
      // required: true,
    },
    link: {
      type: String,
      // required: true,
    },
    is_active: {
      type: Number,
      // required: true,
    },
    is_valid: {
      type: Number,
      // required: true,
    },
    mobiru_condition: {
      type: String,
      // required: true,
    },
    mobiru_grade: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const scrappedModal = new mongoose.model("scrapped_models", scrappedSchema);

module.exports = scrappedModal;
