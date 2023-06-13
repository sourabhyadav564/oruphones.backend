import mongoose from "mongoose";

const testScrappedSchema = new mongoose.Schema(
  {
    make: { 
      type: String,
      // required: true,
    },
    storage: {
      type: mongoose.Schema.Types.Mixed,
      // required: true,
    },
    ram: {
      type: mongoose.Schema.Types.Mixed,
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
    },
    link: {
      type: String,
      // required: true,
    },
    listingId: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      // required: true,
    },
    // created_at: {
    //   type: Date,
    //   // required: true,
    // }
  },
  { timestamps: true }
);

testScrappedSchema.pre("save", async function (next) {
  this.listingId = this._id.toString();
  next();
});

const testScrappedModal = mongoose.model(
  "testing_scrapped_datas",
  testScrappedSchema
);

export = testScrappedModal;
