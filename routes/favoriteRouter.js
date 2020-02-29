const express = require('express');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');

const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //preflight the request
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(`Getting favorites for user id: ${req.user._id}`);
    Favorite.findOne({user: req.user._id})
    .populate('user campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) //search for existing user favorite campsites in document
    .then(favorite => { 
        //if user has favorite document already, only add new favorite campsite(s)
        if (favorite) { 
           let userFavs = favorite.campsites;
           for (i=0; i <= req.body.length -1; i++) {
               if (!userFavs.includes(req.body[i]._id)) {
                    favorite.campsites.push(req.body[i]._id);
               }
            }
            favorite.save()
            .then(favorite => {
                Favorite.findById(favorite._id)
                .populate('user campsites')
                .then(favorite => {
                    console.log('New Favorite Added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
        } else { //create favorite doc for user and add all campsiteIDs from req.body
            const newFavorite = new Favorite({
                campsites: req.body,
                user: req.user._id
            });
            newFavorite.save()
          // Favorite.create({"user": req.user._id}, {"campsites": req.body})
            .then(favorite => {
                if (favorite) { //if new favorite doc created successfully then continue
                    Favorite.findById(favorite._id)
                    .populate('user campsites')
                    .then(favorite => {
                        console.log('Favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                } else {
                    err = new Error('Error creating new favorite document!');
                    err.status = 404;
                    return next(err);
                }
            })
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //delete the favorite document for this user
    Favorite.findOneAndRemove({user: req.user._id})
    .then(response => {
        console.log('Favorite Campsite Deleted!', response);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
})
//Handle favorite campsites specified in URL
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) { //if campsiteId in URL parameter is valid then continue
            console.log('Campsite ', campsite.name);
            Favorite.findOne({user: req.user._id}) //search for existing user favorite campsites in document
            .then(favorite => { 
                //if favorite document exists for user then continue
                if (favorite) { 
                   let userFavs = favorite.campsites;
                   console.log('User Favorites: ', userFavs);
                   console.log('Param: ', req.params.campsiteId);
                   //if campsiteId param is not in favorite doc, then add it to db                 
                    if (!userFavs.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                        .then(favorite => {
                            Favorite.findById(favorite._id)
                            .populate('user campsites')
                            .then(favorite => {
                                console.log('New Favorite Added ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                        })
                    } else { //existing favorite campsite cannot be added again
                        err = new Error(`The ${campsite.name} campsite is already in the list of favorites!`);
                        err.status = 404;
                        return next(err);
                    }
                } else { //create new favorites doc for user and add campsite
                    Favorite.create({"user": req.user._id, "campsites": req.params.campsiteId})
                    .then(favorite => {
                        if (favorite) { //if new favorite doc created successfully then continue
                            Favorite.findById(favorite._id)
                            .populate('user campsites')
                            .then(favorite => {
                                console.log('Favorite Created ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                        } else {
                            err = new Error('Error creating new favorite document!');
                            err.status = 404;
                            return next(err);
                        }
                    })
                }
            })
        } else { //invalid campsite cannot be added to user favorites
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) //search for existing user favorite campsites in document
    .then(favorite => { 
        //if favorite document exists for user then continue
        if (favorite) { 
            //find position of campsiteId in campsite array
            let index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0 ) {
                //if campsiteId exists then remove from array
                favorite.campsites.splice(index, 1);
            }
            favorite.save()
            .then(favorite => {
                Favorite.findById(favorite._id)
                .populate('user campsites')
                .then(favorite => {
                    console.log('Favorite Campsite Deleted!', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch(err => next(err));
        } else { //user does not have any favorites to delete
            err = new Error(`You have no favorite campsites to delete!`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})

module.exports = favoriteRouter;