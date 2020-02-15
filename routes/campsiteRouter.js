const express = require('express');  //Using express middleware
const bodyParser = require('body-parser'); //Body-parser middleware

//Go down one directory and go to modelsdirectory and grab dishes.js
const Campsite = require('../models/campsite'); 

const campsiteRouter = express.Router(); //Router object for express to make routes

campsiteRouter.use(bodyParser.json()); //Parsing out JSON object

//enpoints for all campsites
//HTTP Headers, telling the browser client what data to expect.
//They define the operating parameters of the HTTP transactions.
campsiteRouter.route('/')
.get((req, res, next) => { //HTTP GET from Express
    Campsite.find() //Mongoose query, will always returns a promise
    .then(campsites => { // If there are any dishes in the db, respond with them
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsites); //send json data to client in response stream and automatically close response stream afterward
    })
    .catch(err => next(err)); //pass off error to overall error handler
})
.post((req, res, next) => {
    Campsite.create(req.body) //create new campsite document and save to db server
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete((req, res, next) => {
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

//endpoints for specific campsite
//URL parameter => req.params
campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);  
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body //$set: is mongo operater for setting value
    },  { new: true })
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);  
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);  
    })
    .catch(err => next(err));
});

/************************************************************************/
//Part 2
//endpoints for all comments for specific campsite
campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments); 
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); //pass off error to overall error handler
})
.post((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            campsite.comments.push(req.body); //add comment to array in memory only
            campsite.save() //save to db
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite); //send updated document to client
        }) 
        .catch(err => next(err));   
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
           for (let i = (campsite.comments.length-1); i >= 0; i--) {
                //iterate through all comments with specified Id and remove
                campsite.comments.id(campsite.comments[i]._id).remove(); 
           }
            campsite.save() //save to db
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite); //send updated document to client
        }) 
        .catch(err => next(err));   
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

//endpoints for specific comment for specific campsite
campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => { //check campsite and comment values not null
        if (campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId)); 
        } else if (!campsite) { //campsite not truthy
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else { //comment not truthy
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); //pass off error to overall error handler
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
           if (req.body.rating) {
               campsite.comments.id(req.params.commentId).rating = req.body.rating;
           }
           if (req.body.text) {
                campsite.comments.id(req.params.commentId).text = req.body.text;
           }
           campsite.save()
           .then(campsite => { //on successful save, send response back to client
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
           })
           .catch(err => next(err));
        } else if (!campsite) { //campsite not truthy
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else { //comment not truthy
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); //pass off error to overall error handler
})
.delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            campsite.comments.id(req.params.commentId).remove(); //remove comment
            campsite.save() //save to db
            .then(campsite => { //on successful save, send response back to client
                 res.statusCode = 200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(campsite);
            })
            .catch(err => next(err));
         } else if (!campsite) { //campsite not truthy
             err = new Error(`Campsite ${req.params.campsiteId} not found`);
             err.status = 404;
             return next(err);
         } else { //comment not truthy
             err = new Error(`Comment ${req.params.commentId} not found`);
             err.status = 404;
             return next(err);
         }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;