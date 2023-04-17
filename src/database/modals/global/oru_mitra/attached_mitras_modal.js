const mongoose = require("mongoose");
const validator = require("validator");

const attachedListingsSchema = new mongoose.Schema({
  listingId: {
    type: String,
  },
  attachedOn: {
    type: String,
  },
  attachedTo: {
    type: String,
  },
  status: {
    type: String,
  },
});

const attachedListingsModal = new mongoose.model(
  "attached_listing_mitras",
  attachedListingsSchema
);

module.exports = attachedListingsModal;
