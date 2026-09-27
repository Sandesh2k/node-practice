const { validationResult } = require("express-validator");
const AppError = require("../errors/AppError");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(", ");

    return next(new AppError(message, 422));
  }

  next();
};

module.exports = validate;