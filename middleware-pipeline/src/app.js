const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const noteRoutes = require("./routes/noteRoutes");

const app = express();


app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:3000"
  })
);


app.use(logger);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Notes API is running"
  });
});

app.use("/api/notes", noteRoutes);


app.use(notFound);

app.use(errorHandler);

module.exports = app;