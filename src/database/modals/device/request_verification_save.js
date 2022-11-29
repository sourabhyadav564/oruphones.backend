const mongoose = require('mongoose');
const validator = require('validator');

const saveRequestSchema = new mongoose.Schema({
    userUniqueId: {
        type: String,
        required: true,
    },
    listingId: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    }
},{ timestamps: true })


const saveRequestModal = new mongoose.model('requested_listings', saveRequestSchema);

module.exports = saveRequestModal