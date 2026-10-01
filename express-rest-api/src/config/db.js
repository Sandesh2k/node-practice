const mongoose = require("mongoose");

const getMongoUris = () => {
  const configuredUri = process.env.MONGODB_URI;
  const localUri = "mongodb://127.0.0.1:27017/notes-api";

  return [configuredUri, localUri].filter(Boolean);
};

const connectDB = async () => {
  const uris = getMongoUris();

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`MongoDB connected using ${uri}`);
      return true;
    } catch (error) {
      console.error(`MongoDB connection failed for ${uri}:`, error.message);
    }
  }

  console.warn("Continuing in fallback in-memory mode");
  return false;
};

module.exports = connectDB;