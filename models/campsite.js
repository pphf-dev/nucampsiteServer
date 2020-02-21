const mongoose = require('mongoose'); //import mongoose middleware
require('mongoose-currency').loadType(mongoose); //Load type for cost
const Currency = mongoose.Types.Currency; //assign currency middleware 

// Defining Schema to use Schema object from mongoose
const Schema = mongoose.Schema; //lets us avoid typing mongoose.Schema

//new document
const commentSchema = new Schema({
    //key-value pair or JSON
    rating: { // key named "name"
        type: Number, //required datatype
        min: 1, //minimum value
        max: 5, //maximum value
        required: true //this data is required
    },
    text: {
        type: String,
        required: true
    },
    author: {  //updated to enable using .populate()
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    //One to many relationship
    //This schema can have many comments
    //sub-document of campsiteSchema
    comments: [commentSchema]
}, {
    timestamps: true //automatically gives createdAt and updatedAt props
});

//model is a de-sugared class
//First parameter, 'Campsite' === Singular name of your model.
//Mongoose automatically looks for the plural, lowercased version of your model name
//.model() function makes a copy of the schema
//In other words, it is a constructor function for our model
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;