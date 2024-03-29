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
        unique: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    address: {
        type: [{
            addressType: {
                type: String,
            },
            city: {
                type: String,
                default: "",
            },
            locationId: {
                type: String,
            }
        }],
        default: [],
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    createdDate: {
        type: String,
        default: "",
    }
},{ timestamps: true })

createUserSchema.pre('save', async function (next) {
    this.userUniqueId = this._id;
    next();
});

const createUserModal = new mongoose.model('created_user', createUserSchema);

module.exports = createUserModal