const mongoose = require('mongoose');
const validator = require('validator');

const brandSchema = new mongoose.Schema({
    displayOrder: {
        type: Number,
        required: true,
    }, 
    make: {
        type: String,
        required: true,
    }, 
    imagePath: {
        type: String,
        required: true,
    },
},{ timestamps: true })

const brandModal = new mongoose.model('brands_data', brandSchema);

module.exports = brandModal