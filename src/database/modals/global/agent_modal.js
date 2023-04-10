const mongoose = require("mongoose");
const validator = require("validator");

const createAgentSchema = new mongoose.Schema(
  {
    userUniqueId: {
      type: String,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Active",
    },
    profilePicPath: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

createAgentSchema.pre("save", async function (next) {
  this.userUniqueId = this._id;
  next();
});

const createAgentModal = new mongoose.model("a_created_agents", createAgentSchema);

module.exports = createAgentModal;
