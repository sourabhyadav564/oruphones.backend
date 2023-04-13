const mongoose = require("mongoose");
const validator = require("validator");

const scrappedMitrasSchema = new mongoose.Schema({
  kioskId: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  district: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
});

const scrappedMitrasModal = new mongoose.model(
  "a_listed_oru_mitras",
  scrappedMitrasSchema
);

module.exports = scrappedMitrasModal;
