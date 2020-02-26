//Middlewares
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const passport = require('passport');
const config = require('./config');

//Current working directory
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

//Database
const mongoose = require('mongoose');
const url = config.mongoUrl; //points to my database
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

// Redirect all traffic to secure URL
app.all('*', (req, res, next) => {
  if (req.secure) { //check for https request
      return next();
  } else {
    console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
    res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

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

app.use(passport.initialize());

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