// controllers/audioController.js
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

// Initialize AWS S3
const s3 = new AWS.S3();

const addAudioChunk = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {
        isCustom: true,
        message: "Validation failed",
        details: errors.array(),
        status: 422,
      };
    }

    const files = req.body.chunks;
    if (!files || files.length === 0) {
      throw {
        isCustom: true,
        message: "No audio chunks uploaded",
        status: 400,
      };
    }

    const timestamp = req.body.timestamp || Date.now(); // Use provided timestamp or generate one
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      timestamp.toString()
    );

    console.log(`Saving chunks to folder: ${folderPath}`);

    // Ensure directory exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Process each uploaded chunk
    files.forEach((file, index) => {
      const filePath = path.join(folderPath, `chunk_${index}.wmv`);
      fs.writeFileSync(filePath, Buffer.from(file, "base64")); // Copy the file to ensure it's saved correctly
      console.log(`Chunk saved: ${filePath}`);
    });

    res.status(200).json({
      message: "Audio chunks uploaded successfully",
      folderPath,
    });
  } catch (error) {
    next(error);
  }
};

const ffmpeg = require("fluent-ffmpeg");
const { uploadToS3, getPresignedURL } = require("../services/s3Service");

ffmpeg.setFfmpegPath("C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe");

const mergeAudioChunks = async (req, res, next) => {
  try {
    const { timestamp } = req.params;

    if (!timestamp) {
      throw {
        isCustom: true,
        message: "Timestamp is required",
        status: 400,
      };
    }

    const folderPath = path.join(__dirname, "..", "uploads", timestamp);
    const mergedFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      `${timestamp}.wmv`
    );

    if (!fs.existsSync(folderPath)) {
      throw {
        isCustom: true,
        message: `Folder with timestamp ${timestamp} does not exist`,
        status: 404,
      };
    }

    const chunkFiles = fs
      .readdirSync(folderPath)
      .map((file) => path.join(folderPath, file));

    if (chunkFiles.length === 0) {
      throw {
        isCustom: true,
        message: `No audio chunks found in folder ${folderPath}`,
        status: 400,
      };
    }

    // Merge chunks using ffmpeg
    await new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg();
      ffmpegCommand.input(chunkFiles[0]);
      chunkFiles.forEach((chunk) => {
        ffmpegCommand.input(chunk);
      });

      ffmpegCommand
        .on("end", resolve)
        .on("error", reject)
        .mergeToFile(mergedFilePath);
    });

    const totalChunkDuration = await Promise.all(
      chunkFiles.map(
        (chunk) =>
          new Promise((resolve, reject) => {
            ffmpeg(chunk).ffprobe((err, metadata) => {
              if (err) reject(err);
              else resolve(metadata.format.duration || 0);
            });
          })
      )
    ).then((durations) =>
      durations.reduce((sum, duration) => sum + duration, 0)
    );

    const mergedAudioDuration = await new Promise((resolve, reject) => {
      ffmpeg(mergedFilePath).ffprobe((err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });

    if (Math.abs(totalChunkDuration - mergedAudioDuration) > 1) {
      throw {
        isCustom: true,
        message: "Duration mismatch between chunks and merged audio",
        status: 400,
      };
    }

    await uploadToS3(
      mergedFilePath,
      process.env.AWS_S3_BUCKET_NAME,
      "expedite-commerce",
      `${timestamp}.wmv`
    );

    // Generate a pre-signed URL for the uploaded file
    const s3Key = `${timestamp}.wmv`;
    const signedUrl = getPresignedURL("expedite-commerce", s3Key);

    // Delete folder only if S3 upload is successful
    chunkFiles.forEach((file) => fs.unlinkSync(file));
    fs.rmdirSync(folderPath);

    res.status(200).json({
      message: `Audio merged and uploaded successfully as ${timestamp}.mp3`,
      url: signedUrl,
    });
  } catch (error) {
    next(error);
  }
};

const { deleteFromS3 } = require("../services/s3Service");

const removeAudioFromS3 = async (req, res, next) => {
  try {
    const { timestamp } = req.params;

    if (!timestamp) {
      throw {
        isCustom: true,
        message: "Timestamp is required",
        status: 400,
      };
    }

    const key = `${timestamp}.wmv`;
    const bucketName = "expedite-commerce";

    try {
      await deleteFromS3(key, bucketName);
      res.status(200).json({
        message: `Audio file with timestamp ${timestamp} successfully removed from S3`,
      });
    } catch (err) {
      if (err.code === "NoSuchKey") {
        res.status(404).json({
          message: `File with key ${key} does not exist in S3`,
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAudioChunk,
  mergeAudioChunks,
  removeAudioFromS3,
};
