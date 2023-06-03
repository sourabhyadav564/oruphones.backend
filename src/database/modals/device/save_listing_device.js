const mongoose = require("mongoose");
const validator = require("validator");

const saveListingSchema = new mongoose.Schema(
  {
    charger: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: " ",
    },
    deviceCondition: {
      type: String,
      required: true,
    },
    deviceCosmeticGrade: {
      type: String,
      default: " ",
    },
    deviceFinalGrade: {
      type: String,
      default: " ",
    },
    deviceFunctionalGrade: {
      type: String,
      default: " ",
    },
    listedBy: {
      type: String,
      required: true,
    },
    deviceStorage: {
      type: String,
      required: true,
    },
    earphone: {
      type: String,
      required: true,
    },
    images: {
      type: [
        {
          thumbnailImage: {
            type: String,
          },
          fullImage: {
            type: String,
          },
          isVarified: {
            type: String,
            default: "accepted",
          },
        },
      ],
    },
    defaultImage: {
      type: {
        fullImage: {
          type: String,
        },
      },
      default: {
        fullImage:
          "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/apple/mbr_Apple_iPhone_12_mini.png",
      },
    },
    imei: {
      type: String,
    },
    listingLocation: {
      type: String,
      default: "India",
    },
    listingPrice: {
      type: String,
      required: true,
    },
    make: {
      type: String,
      required: true,
    },
    marketingName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String || Number,
      // required: true,
    },
    model: {
      type: String,
      required: true,
    },
    originalbox: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    recommendedPriceRange: {
      type: String,
      default: "--",
    },
    userUniqueId: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    deviceUniqueId: {
      type: String,
      default: "NA",
    },
    listingId: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    deviceImagesAvailable: {
      type: Boolean,
    },
    verifiedDate: {
      type: String,
      // default: Date.now(),
    },
    listingDate: {
      type: String,
      // default: Date.now(),
    },
    deviceRam: {
      type: String,
    },
    warranty: {
      type: String,
      default: "None",
    },
    isOtherVendor: {
      type: String,
      default: "N",
    },
    questionnaireResults: {
      type: [
        {
          question: {
            type: String,
          },
          questionId: {
            type: Number,
          },
          result: {
            type: String,
          },
          childQuestions: {
            type: [
              {
                type: String,
              },
            ],
          },
          childAnswers: {
            type: {
              type: String,
            },
          },
        },
      ],
    },
    functionalTestResults: {
      type: [
        {
          commandName: {
            type: String,
          },
          startDateTime: {
            type: String,
          },
          displayName: {
            type: String,
          },
          testStatus: {
            type: String,
          },
          endDateTime: {
            type: String,
          },
        },
      ],
    },
    cosmetic: {
      type: {
        0: {
          type: String,
        },
        1: {
          type: String,
        },
        2: {
          type: String,
        }
      },
    },
  },
  { timestamps: true }
);

saveListingSchema.pre("save", async function (next) {
  this.listingId = this._id;
  next();
});

const saveListingModal = new mongoose.model(
  "saved_listings",
  saveListingSchema
);

module.exports = saveListingModal;