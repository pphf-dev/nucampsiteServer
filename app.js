//Middlewares
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
app.use(cookieParser()); //parser for cookies

//Authentication - custom middleware function named auth()
function auth(req, res, next) {
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic'); //lets client know the server is requesting authentication and the authentication method requested is 'Basic'.
        err.status = 401;
        return next(err);
    }
    //parse authorization header and validate username and password
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    if (user ==='admin' && pass === 'password') {
      return next(); //authorized
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

}

app.use(auth);

//Directory for static files
app.use(express.static(path.join(__dirname, 'public')));

/*
* URLS
*/

// endpoints for HTTP requests
app.use('/', indexRouter);
app.use('/users', usersRouter);
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