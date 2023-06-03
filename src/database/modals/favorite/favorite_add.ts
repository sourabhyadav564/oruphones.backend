import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    userUniqueId: {
        type: String,
        required: true
    },
    fav_listings: {
        type: [{
            type: 'String',
            required: true
        }],
        required: true
    },
},{ timestamps: true })

favoriteSchema.index({ userUniqueId: 1 });
const favoriteModal = mongoose.model('favorite_lists', favoriteSchema);

export default favoriteModal;
module.exports = favoriteModal