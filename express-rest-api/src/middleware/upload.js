const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const uploadDirectory = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("File name:", file.originalname);
  console.log("MIME type:", file.mimetype);

  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    const error = new Error("Only JPG, JPEG, and PNG images are allowed");
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;