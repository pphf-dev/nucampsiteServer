const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

//passport-local-mongoose will add username and password for us
const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

//plug it in
userSchema.plugin(passportLocalMongoose);

//create model and export all on same line
module.exports = mongoose.model('User', userSchema); //model is named "User" so the collection will automatically be named "users" by mongoose