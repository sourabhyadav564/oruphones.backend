const mongoose = require('mongoose');
const validator = require('validator');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 40,
    }, 
    email: {
        type: String,
        required: true,
        unique: [true, "This email id is already in use"],
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    }, 
    phoneNumber: {
        type: Number,
        required: true,
        minLength: 10,
        maxLength: 10,
        unique: [true, "This phone number id is already in use"]
    },
    address: {
        type: String,
        required: true,
        validate(value) {
            if(validator.isEmpty(value)) {
                throw new Error("Address cannot be empty")
            }
        }
    }
},{ timestamps: true })

const testModal = new mongoose.model('data_data', testSchema);

module.exports = testModal;