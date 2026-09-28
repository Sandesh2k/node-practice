const express = require("express");

const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  uploadAttachment,
  getAttachment
} = require("../controllers/noteController");

const requireAuth = require("../middleware/requireAuth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const {
  createNoteValidation,
  updateNoteValidation,
  idValidation,
  listNotesValidation
} = require("../validators/noteValidator");

const router = express.Router();

// Every notes route requires authentication
router.use(requireAuth);

// GET /api/v1/notes
router.get(
  "/",
  listNotesValidation,
  validate,
  getAllNotes
);

// GET /api/v1/notes/:id
router.get(
  "/:id",
  idValidation,
  validate,
  getNoteById
);

// POST /api/v1/notes
router.post(
  "/",
  createNoteValidation,
  validate,
  createNote
);

// PUT /api/v1/notes/:id
router.put(
  "/:id",
  updateNoteValidation,
  validate,
  updateNote
);

// DELETE /api/v1/notes/:id
router.delete(
  "/:id",
  idValidation,
  validate,
  deleteNote
);

// Upload attachment
router.post(
  "/:id/attachment",
  idValidation,
  validate,
  upload.single("image"),
  uploadAttachment
);

// Get attachment
router.get(
  "/:id/attachment",
  idValidation,
  validate,
  getAttachment
);


module.exports = router;