const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.timestamp) {
      req.timestamp = req.body.timestamp || Date.now(); // Use a single timestamp for all files in the request
    }

    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      req.timestamp.toString()
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    if (!req.chunkIndex) {
      req.chunkIndex = 0;
    }
    const filename = `chunk_${req.chunkIndex}-${file.originalname}`;
    req.chunkIndex++;
    console.log("Generated Filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
