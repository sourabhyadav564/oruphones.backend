const mongoose = require('mongoose');
const validator = require('validator');

const bestDealHomeSchema = new mongoose.Schema({
    listingId: {
        type: Number,
        required: true,
    }, 
    make: {
        type: String,
        required: true,
    },
    deviceStorage: {
        type: String,
        required: true,
    }, 
    deviceRam: {
        type: String,
    }, 
    marketingName: {
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
    listingPrice: {
        type: String,
        required: true,
    }, 
    listingLocation: {
        type: String,
        required: true,
    }, 
    deviceFinalGrade: {
        type: String,

    },
    listingDate: {
        type: String,
    }, 
    verifiedDate: {
        type: String,
    }, 
    modifiedDate: {
        type: String,
    }, 
    vendorId: {
        type: String,
    },
    vendorLink: {
        type: String,
    },
    vendorLogo: {
        type: String,
    },
    imagePath: {
        type: String,
    },
    isOtherVendor: {
        type: String,
    },
    displayOrder: {
        type: Number,
    },
    verified: {
        type: Boolean,
    },
    favourite: {
        type: Boolean,
    }

},{ timestamps: true })

const bestDealHomeModel = new mongoose.model('complete_listings', bestDealHomeSchema);

module.exports = bestDealHomeModel  