const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //get strategy constructor
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); //used to create, sign and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
    //create token - if you don't set expireIn, token never expires
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};  //options for jwt strategy
//send token in authorization header and as a bearer token - the simplest method
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//key for signing token
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        //verify callback function
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) { //error
                    return done(err, false);
                } else if (user) { //user found and no error
                    return done(null, user);
                } else { //no error but no user found
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    console.log(req.user);
    if (req.user.admin) {
        return next();
    } else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => { //profile object from FB
            User.findOne({facebookId: profile.id}, (err, user) => {
               if (err) { //error
                   return done(err, false);
               }
               if (!err && user) {  //no error and FB user id found in db, so return user object with that data
                   return done(null, user);
               } else { //no error and no FB user id found in db - so create new user document from FB profile data and save to db
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if(err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
               }
            })
        }
    )
)
