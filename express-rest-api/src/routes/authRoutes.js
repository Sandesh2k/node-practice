const express = require("express");

const {
  register,
  login
} = require("../controllers/authController");

const validate = require("../middleware/validate");

const {
  registerValidation,
  loginValidation
} = require("../validators/authValidator");

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  validate,
  register
);

router.post(
  "/login",
  loginValidation,
  validate,
  login
);

module.exports = router;