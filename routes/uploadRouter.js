const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //store uploaded file to public/images folder
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); //keep original filename
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //if not an image file
        //create error and tell Multer to reject the upload
        return cb(new Error('You can upload only image files!'), false);
    }
    // file = image, so don't pass back an error and tell Multer to accept file

    cb(null, true);
};

//call Multer function
const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
//Let Multer handle uploading single file whose input name field is imageFile
.post(authenticate.verifyUser, authenticate.verifyUser, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); //pass Multer file object with file info back to client
})
.put(authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;