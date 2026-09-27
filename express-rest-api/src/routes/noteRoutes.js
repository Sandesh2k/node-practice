const express = require("express");

const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} = require("../controllers/noteController");

const validate = require("../middleware/validate");

const {
  createNoteValidation,
  updateNoteValidation,
  idValidation,
  listNotesValidation
} = require("../validators/noteValidator");

const router = express.Router();

router.get(
  "/",
  listNotesValidation,
  validate,
  getAllNotes
);

router.get(
  "/:id",
  idValidation,
  validate,
  getNoteById
);

router.post(
  "/",
  createNoteValidation,
  validate,
  createNote
);
router.put(
  "/:id",
  updateNoteValidation,
  validate,
  updateNote
);

router.delete(
  "/:id",
  idValidation,
  validate,
  deleteNote
);

module.exports = router;