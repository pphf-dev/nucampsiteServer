const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    campsites: [{ //array of campsite object IDs
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }],
    user: { //one user object ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
