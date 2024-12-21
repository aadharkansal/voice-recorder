const validateAddAudioChunk = (req, res, next) => {
  // Ensure the file is uploaded
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please upload an audio file." });
  }

  // Ensure the file is an audio type (you can add more audio types if needed)
  const allowedMimeTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({
        message: "Invalid file type. Only audio files (MP3, WAV) are allowed.",
      });
  }

  // Optional: Check if the file size exceeds 10MB
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxFileSize) {
    return res
      .status(400)
      .json({ message: "File is too large. Max size is 10MB." });
  }

  // Everything is valid, proceed to the next middleware or controller
  next();
};

module.exports = validateAddAudioChunk;
