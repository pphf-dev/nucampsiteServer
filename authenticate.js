const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; //get strategy constructor
const User = require('./models/user');

//export 'local' property and for its value we'll use passport method called
//'passport.use' which is how we add the specific strategy plug-in that we want 
//to use for our passport implementation, and what we want to use is a strategy
//of LocalStrategy so we create a new instance of LocalStrategy and pass that in.
//The LocalStrategy instance requires a verify callback function to verify the
//username and password against the locally stored usernames and passwords.
//We'll use the authenticate method provided by the passport-local-mongoose plugin
//for that which is a method on the User model, so all we have to do is say
//User.authenticate() and we'll call that function here.
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//When using sessions with passport we need to do a couple of operations on the 
//user called serialization and deserialization.  When a user has been
//successfully verified, the user data has to be grabbed from the session and added
//to the request object.  There's a process called deserialization that needs to
//happen to that data in order for that to be possible.  When we receive data 
//about the user from the request object and we need to convert it to store in the 
//session data then a corresponding process called serialization needs to happen.
//So, whenever we use sessions in passport we'll need to serialize and deserialize
//the user instance. We do that here using methods provided by passport and 
//passport-local-mongoose.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());