const mongoose = require("mongoose");
const validator = require("validator");

const citySchema = new mongoose.Schema(
  {
    imgpath: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    displayWithImage: {
      type: String,
      required: true,
    },
    // locationId: {
    //     type: String,
    //     required: true,
    // }
  },
  { timestamps: true }
);

// citySchema.pre('save', async function (next) {
//     this.locationId = this._id;
//     next();
// });


const cityModal = new mongoose.model("listed_cities", citySchema);

module.exports = cityModal;
