const mongoose = require("mongoose");
const validator = require("validator");

const createAgentSchema = new mongoose.Schema(
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
    profilePicPath: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    type: {
      type: String,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    kioskId: {
      type: String,
    },
    upiId: {
      type: String,
    },
    agentId: {
      type: String,
    },
    images: {
      type: [
        {
          thumbImage: {
            type: String,
          },
          fullImage: {
            type: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

createAgentSchema.pre("save", async function (next) {
  this.userUniqueId = this._id;
  next();
});

const createAgentModal = new mongoose.model(
  "a_created_agents",
  createAgentSchema
);

module.exports = createAgentModal;
