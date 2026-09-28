require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Parse JSON
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "http://localhost:5000"
  })
);

// Logging
app.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use(limiter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes API is running"
  });
});

// Authentication
app.use("/auth", authRoutes);

// Protected Notes API
app.use("/api/v1/notes", noteRoutes);

// 404
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;