// utils/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  if (err.isCustom) {
    // This is a custom error
    return res
      .status(err.status || 400)
      .json({ message: err.message, details: err.details });
  }

  // Generic server error handling
  return res.status(500).json({
    message: "Something went wrong on the server.",
    error: err.message,
  });
}

module.exports = errorHandler;
