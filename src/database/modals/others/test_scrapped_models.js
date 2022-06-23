const mongoose = require("mongoose");
const validator = require("validator");

const testScrappedSchema = new mongoose.Schema(
  {
    storage: {
      type: Number || String,
      // required: true,
    },
    ram: {
      type: Number || String,
      // required: true,
    },
    warranty: {
      type: String,
      // required: true,
    },
    price: {
      type: Number || String,
      // required: true,
    },
    model_name: {
      type: String,
      // required: true,
    },
    vendor_id: {
      type: Number || String,
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
      type: Number || String,
      // required: true,
    }
  },
  { timestamps: true }
);

const testScrappedModal = new mongoose.model("testing_scrapped_datas", testScrappedSchema);

module.exports = testScrappedModal;
