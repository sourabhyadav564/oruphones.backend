const mongoose = require('mongoose');
const validator = require('validator');

const testsaveListingSchema = new mongoose.Schema({
    charger: {
        type: String,
    }, 
    color: {
        type: String,
    },
    deviceCondition: {
        type: String,
    },
    deviceCosmeticGrade: {
        type: String
    },
    deviceFinalGrade: {
        type: String
    },
    deviceFunctionalGrade: {
        type: String
    },
    listedBy: {
        type: String,
    },
    deviceStorage: {
        type: String,
    },
    earphone: {
        type: String,
    },
    images: {
        type: [{
            thumbnailImage: {
                type: String,
            },
            fullImage: {
                type: String,
            },
        }],
    },
    defaultImage: {
        type: {
            fullImage: {
                type: String,
            },
        },
        // default: {
        //     fullImage: "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/apple/mbr_Apple_iPhone_12_mini.png"
        // },
    },
    imei: {
        type: String,
    },
    listingLocation: {
        type: String,
        // default: 'India',
    },
    listingPrice: {
        type: String,
    },
    make: {
        type: String,
    },
    marketingName: {
        type: String,
    },
    mobileNumber: {
        type: String || Number,
    }, 
    model: {
        type: String,
    },
    originalbox: {
        type: String,
    },
    platform: {
        type: String,
    },
    recommendedPriceRange: {
        type: String,
        // default: '--',
    },
    userUniqueId: {
        type: String,
    },
    verified: {
        type: Boolean,
        // default: false,
    },
    deviceUniqueId: {
        type: String,
        // default: 'NA',
    },
    listingId: {
        type: String,
        
    },
    status: {
        type: String,
        // default: 'Active',
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
    recommendedPriceRange: {
        type: String,
    },
    deviceRam: {
        type: String,
    },
    questionnaireResults: {
        type: [{
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
                type: [{
                    type: Number,
                }]
            },
            childAnswers: {
                type: {
                    type: String,
                }
            },
        }],
    },
    functionalTestResults: {
        type: [{
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
            }
        }],
    }
},{ timestamps: true })

testsaveListingSchema.pre('save', async function (next) {
    this.listingId = this._id;
    next();
});

const testsaveListingModal = new mongoose.model('test_saved_listings', testsaveListingSchema);

module.exports = testsaveListingModal