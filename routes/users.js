const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//handle new user sign-up endpoint
router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username}) //check to see if username already exists
    .then(user => {
      if (user) { //user document was found with matching name
          const err = new Error(`User ${req.body.username} already exists!`);
          err.status = 403;
          return next(err);
      } else { //no user doc with matching name was found, so create a new one
          User.create({ //create regular user - no admin privileges
            username: req.body.username,
            password: req.body.password
          })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({status: 'Registration Successful!', user: user});
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err)); //error raised during findOne method
});

router.post('/login', (req, res, next) => { 
    //check if user is already logged in (has session-id with cookie)
    if (!req.session.user) { //user not logged in yet
      const authHeader = req.headers.authorization;
          if(!authHeader) {
              const err = new Error('You are not authenticated!');
              res.setHeader('WWW-Authenticate', 'Basic'); //lets client know the server is requesting authentication and the authentication method requested is 'Basic'.
              err.status = 401;
              return next(err);
          }
          //parse authorization header and validate username and password
          const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
          const username = auth[0];
          const password = auth[1];
          
          User.findOne({username: username}) //check username for match
          .then(user => {
              if (!user) { //no match
                  const err = new Error(`User ${username} does not exist!`);
                  err.status = 401;
                  return next(err);
              } else if (user.password !== password) { //user matched but pwd does not
                  const err = new Error('Your password is incorrect!');
                  err.status = 401;
                  return next(err);
              } else if (user.username === username && user.password === password) {
                  //both match, so user is authenticated
                  req.session.user = 'authenticated'
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'text/plain');
                  res.end('You are authenticated!');
              }
          })
          .catch(err => next(err));
    } else { //session already being tracked for this client
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
});

//handle user logout - server can stop tracking
router.get('/logout', (req, res, next) => { //user is actually logged in
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
