// controllers/audioController.js
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

// Initialize AWS S3
const s3 = new AWS.S3();

const addAudioChunk = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {
        isCustom: true,
        message: "Validation failed",
        details: errors.array(),
        status: 422,
      };
    }

    const chunk = req.file; // The file uploaded
    if (!chunk) {
      throw {
        isCustom: true,
        message: "No audio chunk uploaded",
        status: 400,
      };
    }

    // Process the chunk (store temporarily)
    const filePath = path.join(__dirname, "..", "uploads", chunk.originalname);
    fs.writeFileSync(filePath, chunk.buffer);

    res.status(200).json({ message: "Audio chunk uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

const mergeAudioChunks = async (req, res, next) => {
  try {
    // Implement merging logic here (just an example)
    const chunkFiles = fs.readdirSync(path.join(__dirname, "..", "uploads"));

    // Simulating the merging process
    const mergedFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "merged_audio.mp3"
    );
    fs.writeFileSync(mergedFilePath, "Merged audio content"); // This is a placeholder logic

    // Upload merged file to AWS S3
    const fileContent = fs.readFileSync(mergedFilePath);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: "merged_audio.mp3",
      Body: fileContent,
      ContentType: "audio/mp3",
    };
    await s3.upload(params).promise();

    // Clean up temporary files
    chunkFiles.forEach((file) => {
      fs.unlinkSync(path.join(__dirname, "..", "uploads", file));
    });

    res
      .status(200)
      .json({ message: "Audio merged and uploaded successfully to S3" });
  } catch (error) {
    next(error);
  }
};

const removeAudioFromS3 = async (req, res, next) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: "merged_audio.mp3",
    };

    await s3.deleteObject(params).promise();
    res.status(200).json({ message: "Audio removed from S3" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAudioChunk,
  mergeAudioChunks,
  removeAudioFromS3,
};
