const mongoose = require('mongoose');
const validator = require('validator');

const imageUploadSchema = new mongoose.Schema({
    deviceFace: {
        type: String,
        // required: true,
    }, 
    deviceStorage: {
        type: String,
        // required: true,
    },
    make: {
        type: String,
        // required: true,
    },
    model: {
        type: String,
        // required: true,
    },
    userUniqueId: {
        type: String,
        default: 'Guest',
    },
    imagePath: {
        type: String,
        // required: true,
    }
},{ timestamps: true })

const imageUploadModal = new mongoose.model('image_uploads', imageUploadSchema);

module.exports = imageUploadModal