const mongoose = require('mongoose');
const validator = require('validator');

const citySchema = new mongoose.Schema({
    imgpath: {
        type: String,
    }, 
    city: {
        type: String,
        required: true,
    }
},{ timestamps: true })

const cityModal = new mongoose.model('listed_cities', citySchema);

module.exports = cityModal