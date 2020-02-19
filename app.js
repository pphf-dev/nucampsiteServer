//Middlewares
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session); //require function returns a function as its return value, then we immediately call that return funtion with the second parameter list of (session)

//Current working directory
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//Database
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/nucampsite'; //points to my database
const connect = mongoose.connect(url, {
  //handle deprecation warnings
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
    err => console.log(err) //alternate way to handle promise rejection
  );

//Using express framework
var app = express();

// View Engine setup - tell server where to go for static files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());

// Parses out req.body when a user goes to a POST route.
// output => JSON Object
app.use(express.urlencoded({ extended: false }));
//cannot use cookie-parse and express-session simultaneously, causes conflicts
//app.use(cookieParser('12345-67890-09876-54321')); //parser for cookies with secret key 

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false, //empty sessions won't get saved / no cookie sent to client
    resave: false, //don't resave on every request for that session
    store: new FileStore() //create new fileStore object to save session information to server hard disk rather than just in application memory
}));

// endpoints for HTTP requests that do NOT require authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

//Authentication - custom middleware function named auth()
function auth(req, res, next) {
    console.log(req.session);

    //check if client is authenticated (has session with user field)    
    if (!req.session.user) { 
        //no session with user field
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else { //yes, session with user field now check if authenticated
        if (req.session.user === 'authenticated') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);

//Directory for static files
app.use(express.static(path.join(__dirname, 'public')));

/*
* URLS
*/

// endpoints for HTTP requests that require authentication
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;