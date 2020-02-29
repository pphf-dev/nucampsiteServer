const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log('Origin:', req.header('Origin'));
    //check to see if request origin is in the server whitelist
    if (whitelist.indexOf(req.header('Origin')) !== -1) { //if not -1 then origin is in whitelist
        corsOptions = { origin: true }; //allow request to be accepted
    } else { //not in whitelist
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //returns middleware function configured to set cors Access-Control-Allow-Origin header on a response object with * as its value = allow cors for all origins
exports.corsWithOptions = cors(corsOptionsDelegate); //checks whitelist before returning Access-Control-Allow-Origin header with the whitelisted URL as its value, if not on whitelist then cors header is omitted from request