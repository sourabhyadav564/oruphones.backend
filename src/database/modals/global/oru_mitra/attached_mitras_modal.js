const mongoose = require("mongoose");
const validator = require("validator");

const attachedListingsSchema = new mongoose.Schema({
  listingId: {
    type: String,
  },
  attachedTo: {
    type: String,
  },
  attachedOn: {
    type: Date,
    // type: String,
  },
  previousData: {
    type: [
      {
        attachedOn: {
          type: Date,
          //   type: String,
        },
        attachedTo: {
          type: String,
        },
      },
    ],
  },
});

const attachedListingsModal = new mongoose.model(
  "attached_listing_mitras",
  attachedListingsSchema
);

module.exports = attachedListingsModal;
