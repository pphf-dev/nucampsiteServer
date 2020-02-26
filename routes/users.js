const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, 
    function(req, res, next) {
        if (req.user.admin) {
            User.find() //Mongoose query, will always return a promise
            .then(users => { // If there are any users in the db, respond with them
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users); //send json data to client in response stream and automatically close response stream afterward
            })
            .catch(err => next(err)); //pass off error to overall error handler
        } else {
            console.log('Do nothing. Error handled by verifyAdmin()');
        }
});

// handle new user sign-up endpoint
router.post('/signup', cors.corsWithOptions, (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500; //internal server error
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else { //handle first and last names if provided
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }
                    //authenticate method returns a function so we need to call
                    //that function by setting up a second arguments list here
                    passport.authenticate('local')(req, res, () => {
                        //response to client
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    });
                });
            }
        }
    )
});

// passport.authenticate handles logging in the user from now on, including
// challenging user for credentials, parsing credentials from request body, etc
// All we need to do is send response to client. Any errors already handled
// by passport.  Set up response for successful log in.
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    //user local strategy to authenticate user, but then issue token to user
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //add token to response so it will always be carried in the header
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

//handle user logout - server can stop tracking
router.get('/logout', cors.corsWithOptions, (req, res, next) => { //user is actually logged in
    if (req.session) {
        req.session.destroy(); //delete session file on server side
        res.clearCookie('session-id'); //clear cookie on client
        res.redirect('/'); //redirect user to root path
    } else { //user not actually logged in
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});

module.exports = router;
