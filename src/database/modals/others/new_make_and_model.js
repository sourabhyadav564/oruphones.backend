const mongoose = require("mongoose");
const validator = require("validator");

const newMakeAndSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      // required: true,
    },
    marketingName: {
      type: String,
      // required: true,
    },
    models: {
      type: [{
        type: String,
        // required: true,
      }]
    },
    storage: {
      type: [{
        type: String,
        // required: true,
      }]
    },
    color: {
      type: [{
        type: String,
        // required: true,
      }]
    },
    // ram: {
    //   type: [{
    //     type: String,
    //     // required: true,
    //   }]
    // }
  },
  { timestamps: true }
);

const newMakeAndModal = new mongoose.model(
  "make_and_models",
  newMakeAndSchema
);

module.exports = newMakeAndModal;
