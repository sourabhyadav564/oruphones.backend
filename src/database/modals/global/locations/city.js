const mongoose = require("mongoose");
const validator = require("validator");

const citySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    parentId: {
      type: Number,
    },
  },
  { timestamps: true }
);

const cityAreaModal = new mongoose.model("area_cities", citySchema);

module.exports = cityAreaModal;
