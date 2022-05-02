const mongoose = require('mongoose');
const validator = require('validator');

const saveListingSchema = new mongoose.Schema({
    charger: {
        type: String,
        required: true,
    }, 
    color: {
        type: String,
    },
    deviceCondition: {
        type: String,
        required: true,
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
        type: [{
            fullImage: {
                type: String,
                // default: "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/apple/mbr_Apple_iPhone_12_mini.png"
            },
        }],
        default: [{
            type: String,
            default: "https://zenrodeviceimages.s3.us-west-2.amazonaws.com/mobiru/product/mobiledevices/img/apple/mbr_Apple_iPhone_12_mini.png"
        }],
    },
    imei: {
        type: String,
    },
    listingLocation: {
        type: String,
        default: 'India',
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
        required: true,
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
        default: '--',
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
        default: 'NA',
    }
},{ timestamps: true })

const saveListingModal = new mongoose.model('saved_listings', saveListingSchema);

module.exports = saveListingModal