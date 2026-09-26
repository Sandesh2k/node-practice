const notes = require("../data/notes");
const AppError = require("../errors/AppError");

// GET /api/notes
const getAllNotes = (req, res) => {
  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes
  });
};

// GET /api/notes/:id
const getNoteById = (req, res, next) => {
  const id = Number(req.params.id);

  const note = notes.find((note) => note.id === id);

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  res.status(200).json({
    success: true,
    data: note
  });
};

// POST /api/notes
const createNote = (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return next(
      new AppError("Title and content are required", 400)
    );
  }

  const newNote = {
    id: notes.length > 0 ? notes[notes.length - 1].id + 1 : 1,
    title,
    content
  };

  notes.push(newNote);

  res.status(201).json({
    success: true,
    data: newNote
  });
};

// PUT /api/notes/:id
const updateNote = (req, res, next) => {
  const id = Number(req.params.id);

  const note = notes.find((note) => note.id === id);

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return next(
      new AppError("Title and content are required", 400)
    );
  }

  note.title = title;
  note.content = content;

  res.status(200).json({
    success: true,
    data: note
  });
};

// DELETE /api/notes/:id
const deleteNote = (req, res, next) => {
  const id = Number(req.params.id);

  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return next(new AppError("Note not found", 404));
  }

  const deletedNote = notes.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
    data: deletedNote
  });
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};