const mongoose = require("mongoose");
const validator = require("validator");

const scrappedSchema = new mongoose.Schema(
  {
    storage: {
      type: String,
      // required: true,
    },
    ram: {
      type: Number,
      // required: true,
    },
    warranty: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    model_id: {
      type: Number,
      // required: true,
    },
    model_name: {
      type: String,
      // required: true,
    },
    vendor_id: {
      type: Number,
      // required: true,
    },
    link: {
      type: String,
      // required: true,
    },
    mobiru_condition: {
      type: String,
      // required: true,
    },
    type: {
      type: String,
      // required: true,
    },
    actualPrice: {
      type: Number,
      // required: true,
    }
  },
  { timestamps: true }
);

const scrappedModal = new mongoose.model("complete_scrapped_models", scrappedSchema);

module.exports = scrappedModal;
