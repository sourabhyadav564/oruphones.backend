const mongoose = require("mongoose");
const validator = require("validator");

const olxAgentSchema = new mongoose.Schema(
  {
    userUniqueId: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

olxAgentSchema.pre("save", async function (next) {
  this.userUniqueId = this._id;
  next();
});

const olxAgentModal = new mongoose.model("a_olx_agents", olxAgentSchema);

module.exports = olxAgentModal;
