// services/s3Service.js
const fs = require("fs");
const s3 = require("../config/aws");

// Upload the merged file to S3
const uploadToS3 = (filePath, bucketName, key) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: "audio/wmv",
  };

  return s3.upload(params).promise();
};

// Delete the file from S3
const deleteFromS3 = async (s3Key, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  try {
    return await s3.deleteObject(params).promise();
  } catch (err) {
    throw err;
  }
};

const getPresignedURL = (bucketName, key, expiresIn = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn, // Default expiration is 1 hour
  };

  return s3.getSignedUrl("getObject", params);
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedURL,
};
