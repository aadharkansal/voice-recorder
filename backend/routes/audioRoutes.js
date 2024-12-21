// routes/audioRoutes.js
const express = require("express");
const uploadMiddleware = require("../middlewares/uploadMiddleware");
const audioController = require("../controllers/audioController");
const validateAddAudioChunk = require("../middlewares/validationMiddleware");

const router = express.Router();

// Set the base path for all audio-related routes
const baseAudioPath = "/audio";

// Endpoint for adding an audio chunk
router.post(
  `${baseAudioPath}/add`,
  uploadMiddleware.single("chunk"),
  validateAddAudioChunk,
  audioController.addAudioChunk
);

// Endpoint for merging and uploading the audio chunks
router.post(`${baseAudioPath}/merge`, audioController.mergeAudioChunks);

// Endpoint for removing the merged audio file from S3
router.delete(`${baseAudioPath}/remove`, audioController.removeAudioFromS3);

module.exports = router;
