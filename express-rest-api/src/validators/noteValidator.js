const { body, param, query } = require("express-validator");

const createNoteValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters")
];

const updateNoteValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters")
];

const idValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
];

const listNotesValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be 0 or greater"),

  query("sortBy")
    .optional()
    .isIn(["id", "title", "createdAt"])
    .withMessage("sortBy must be id, title, or createdAt"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc")
];

module.exports = {
  createNoteValidation,
  updateNoteValidation,
  idValidation,
  listNotesValidation
};