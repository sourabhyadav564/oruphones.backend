const mongoose = require("mongoose");
const validator = require("validator");

const scrappedLogSchema = new mongoose.Schema(
  {
    cron_job_name: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      // required: true,
    },
    total_scrapped_models: {
      type: Number,
      // required: true,
    },
    total_scrapped_records: {
      type: Number,
      // required: true,
    },
    total_skipped_models: {
      type: Number,
      // required: true,
    },
    type: {
      type: String,
      // required: true,
    },
    start_time: {
        type: Date,
        // required: true,
    },
    end_time: {
        type: Date,
        // required: true,
    },
    vendor_id: {
        type: Number,
        // required: true,
    },
  },
  { timestamps: true }
);

scrappedLogSchema.pre("save", async function (next) {
  this.listingId = this._id;
  next();
});

const scrappedLogModal = new mongoose.model(
  "testing_cron_job_logs",
  scrappedLogSchema
);

module.exports = scrappedLogModal;
