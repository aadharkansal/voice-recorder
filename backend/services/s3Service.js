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
    ContentType: "audio/mpeg",
  };

  return s3.upload(params).promise();
};

// Delete the file from S3
const deleteFromS3 = (s3Key, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: s3Key,
  };

  return s3.deleteObject(params).promise();
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
