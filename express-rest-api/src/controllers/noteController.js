const fs = require("fs");
const path = require("path");

const notes = require("../data/notes");
const AppError = require("../errors/AppError");

// GET /api/v1/notes
const getAllNotes = (req, res) => {
  let result = notes.filter(
    (note) => note.userId === req.user.userId
  );

  const {
    limit = 10,
    offset = 0,
    category,
    search,
    sortBy = "id",
    order = "asc"
  } = req.query;

  // Filtering
  if (category) {
    result = result.filter(
      (note) =>
        note.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Searching
  if (search) {
    const searchTerm = search.toLowerCase();

    result = result.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );
  }

  // Sorting
  result.sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) {
      return order === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return order === "asc" ? 1 : -1;
    }

    return 0;
  });

  const total = result.length;

  const paginatedNotes = result.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.status(200).json({
    success: true,
    pagination: {
      total,
      limit: Number(limit),
      offset: Number(offset),
      count: paginatedNotes.length
    },
    data: paginatedNotes
  });
};

// GET /api/v1/notes/:id
const getNoteById = (req, res, next) => {
  const id = Number(req.params.id);

  const note = notes.find(
    (note) =>
      note.id === id &&
      note.userId === req.user.userId
  );

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  res.status(200).json({
    success: true,
    data: note
  });
};

// POST /api/v1/notes
const createNote = (req, res, next) => {
  const {
    title,
    content,
    category = "general"
  } = req.body;

  const duplicate = notes.find(
    (note) =>
      note.userId === req.user.userId &&
      note.title.toLowerCase() === title.toLowerCase()
  );

  if (duplicate) {
    return next(
      new AppError(
        "You already have a note with this title",
        409
      )
    );
  }

  const newNote = {
    id: notes.length
      ? Math.max(...notes.map((note) => note.id)) + 1
      : 1,

    userId: req.user.userId,
    title,
    content,
    category,
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);

  res.status(201).json({
    success: true,
    data: newNote
  });
};

// PUT /api/v1/notes/:id
const updateNote = (req, res, next) => {
  const id = Number(req.params.id);

  const note = notes.find(
    (note) =>
      note.id === id &&
      note.userId === req.user.userId
  );

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  const {
    title,
    content,
    category = note.category
  } = req.body;

  const duplicate = notes.find(
    (item) =>
      item.userId === req.user.userId &&
      item.id !== id &&
      item.title.toLowerCase() === title.toLowerCase()
  );

  if (duplicate) {
    return next(
      new AppError(
        "You already have a note with this title",
        409
      )
    );
  }

  note.title = title;
  note.content = content;
  note.category = category;

  res.status(200).json({
    success: true,
    data: note
  });
};

// DELETE /api/v1/notes/:id
const deleteNote = (req, res, next) => {
  const id = Number(req.params.id);

  const index = notes.findIndex(
    (note) =>
      note.id === id &&
      note.userId === req.user.userId
  );

  if (index === -1) {
    return next(new AppError("Note not found", 404));
  }

  notes.splice(index, 1);

  res.status(204).send();
};

// POST /api/v1/notes/:id/attachment
const uploadAttachment = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Check note ownership
    const note = notes.find(
      (note) =>
        note.id === id &&
        note.userId === req.user.userId
    );

    if (!note) {
      // Delete uploaded file if ownership check fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return next(new AppError("Note not found", 404));
    }

    // Multer didn't receive a file
    if (!req.file) {
      return next(
        new AppError(
          "Please upload an image file",
          400
        )
      );
    }

    // Save attachment metadata
    note.attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: {
        noteId: note.id,
        attachment: note.attachment
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/notes/:id/attachment
const getAttachment = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Check note ownership
    const note = notes.find(
      (note) =>
        note.id === id &&
        note.userId === req.user.userId
    );

    if (!note) {
      return next(new AppError("Note not found", 404));
    }

    if (!note.attachment) {
      return next(
        new AppError(
          "No attachment found for this note",
          404
        )
      );
    }

    const filePath = path.join(
      __dirname,
      "../uploads",
      note.attachment.filename
    );

    // Check whether file exists
    if (!fs.existsSync(filePath)) {
      return next(
        new AppError(
          "Attachment file not found",
          404
        )
      );
    }

    // Tell client what type of file is being returned
    res.setHeader(
      "Content-Type",
      note.attachment.mimetype
    );

    res.setHeader(
      "Content-Length",
      note.attachment.size
    );

    // Stream file instead of loading entire image into memory
    const fileStream = fs.createReadStream(filePath);

    fileStream.on("error", (error) => {
      next(error);
    });

    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  uploadAttachment,
  getAttachment
};