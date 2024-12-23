const validateAddAudioChunks = (req, res, next) => {
  const { chunks, timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).json({ message: "Timestamp is required." });
  }

  if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
    return res.status(400).json({ message: "No audio chunks provided." });
  }

  next();
};

const getMimeType = (buffer) => {
  const mp3Header = buffer.slice(0, 3).toString("hex");
  if (mp3Header === "494433") {
    return "audio/mpeg"; // MP3 file
  }
  return null;
};

module.exports = validateAddAudioChunks;
