const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          message: "File size must not exceed 2 MB"
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        message: err.message
      }
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message: err.message || "Internal Server Error"
    }
  });
};

module.exports = errorHandler;