const express = require('express'); //Using Express middleware
const bodyParser = require('body-parser'); //Body-parser middleware
const Partner = require('../models/partner'); //Go down one dir to models and grab partner.js
const authenticate = require('../authenticate');

const partnerRouter = express.Router(); //Router object for Express to make routes

partnerRouter.use(bodyParser.json()); //Parsing out JSON object

partnerRouter.route('/')
.get((req, res, next) => { //HTTP GET from Express - want to get all partners from db
    Partner.find() //Mongoose query to return all partners
    .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners); //send json data to client
    })
    .catch(err => next(err)); //pass error to overall error handler
})
.post(authenticate.verifyUser, (req, res, next) => {
    Partner.create(req.body) //create new partner document and save to db
    .then(partner => {
        console.log('Partner Created', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /partners');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.deleteMany() //delete all partners from db
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId')
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body //$set: is mongo operator for setting values
    }, { new: true })
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;