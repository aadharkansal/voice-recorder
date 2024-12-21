// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Set up multer to store chunks temporarily on the server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Use a timestamp to prevent filename collisions
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
