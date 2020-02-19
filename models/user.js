const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

//create model and export all on same line
module.exports = mongoose.model('User', userSchema); //model is named "User" so the collection will automatically be named "users" by mongoose