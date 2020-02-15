const mongoose = require('mongoose'); //import mongoose middleware
const Schema = mongoose.Schema; //define Schema to use Schema object from mongoose

//new document schema
const partnerSchema = new Schema ({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

//Create model
const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;