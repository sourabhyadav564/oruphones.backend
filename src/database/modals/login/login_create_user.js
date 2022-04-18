const mongoose = require('mongoose');
const validator = require('validator');

const createUserSchema = new mongoose.Schema({
    userUniqueId: {
        type: String,
        // required: true,
    },
    userName: {
        type: String,
        // required: true,
        default: "",
    }, 
    userType: {
        type: String,
        // required: true,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        default: "",
    },
    isaccountexpired: {
        type: Boolean,
        default: false,
    },
    profilePicPath: {
        type: String,
        default: "",
    },
    mobileNumber: {
        type: String,
        required: true,
        default: "",
    },
    countryCode: {
        type: String,
        required: true,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
},{ timestamps: true })

createUserSchema.pre('save', async function (next) {
    console.log("hello")
    this.userUniqueId = this._id;
    next();
});

const createUserModal = new mongoose.model('created_user', createUserSchema);

module.exports = createUserModal