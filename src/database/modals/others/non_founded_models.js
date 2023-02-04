const mongoose = require("mongoose");
const validator = require("validator");

const nonFoundedModelsSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      // required: true,
    },
    marketingName: {
      type: String,
      // required: true,
    },
    model: {
      type: String,
      // required: true,
    },
    deviceStorage: {
      type: String,
      // required: true,
    },
    ram: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const NonFoundedModels = new mongoose.model(
  "non_founded_models",
  nonFoundedModelsSchema
);

module.exports = NonFoundedModels;
