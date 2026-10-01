const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const notes = require("../data/notes");
const AppError = require("../errors/AppError");
const Note = require("../models/Note");

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const serializeNote = (note) => {
  const doc = note && note.toObject ? note.toObject() : note;
  const ownerValue = doc.owner ?? doc.userId;
  const idValue = doc._id ? doc._id.toString() : doc.id;

  return {
    ...doc,
    id: idValue,
    _id: undefined,
    userId: ownerValue,
    owner: ownerValue,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || doc.createdAt || new Date().toISOString(),
    passwordHash: undefined,
  };
};

const getNoteStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = await Note.aggregate([
      {
        $facet: {
          notesPerUser: [
            {
              $group: {
                _id: "$owner",
                totalNotes: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                userId: { $toString: "$_id" },
                totalNotes: 1,
                email: "$user.email",
              },
            },
            { $sort: { totalNotes: -1, userId: 1 } },
          ],
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, tag: "$_id", count: 1 } },
          ],
          notesPerDay: [
            {
              $match: {
                createdAt: {
                  $gte: sevenDaysAgo,
                  $lte: now,
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
          ],
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: stats[0] || { notesPerUser: [], topTags: [], notesPerDay: [] },
    });
  } catch (error) {
    next(error);
  }
};

const getAllNotes = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, category, search, sortBy = "createdAt", order = "desc" } = req.query;

    const query = { owner: req.user.userId };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: escapeRegExp(search), $options: "i" } },
        { content: { $regex: escapeRegExp(search), $options: "i" } },
      ];
    }

    const sortFieldMap = { id: "_id", userId: "owner", createdAt: "createdAt", updatedAt: "updatedAt" };
    const sortField = sortFieldMap[sortBy] || sortBy;
    const sort = { [sortField]: order === "asc" ? 1 : -1 };

    const [allNotes, total] = await Promise.all([
      Note.find(query).sort(sort).skip(Number(offset)).limit(Number(limit)).lean(),
      Note.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      pagination: { total, limit: Number(limit), offset: Number(offset), count: allNotes.length },
      data: allNotes.map(serializeNote),
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.userId }).lean();
    if (!note) return next(new AppError("Note not found", 404));

    return res.status(200).json({ success: true, data: serializeNote(note) });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, category = "general", tags = [] } = req.body;
    const trimmedTitle = typeof title === "string" ? title.trim() : title;
    const duplicate = await Note.findOne({
      owner: req.user.userId,
      title: { $regex: `^${escapeRegExp(trimmedTitle)}$`, $options: "i" },
    });

    if (duplicate) {
      return next(new AppError("You already have a note with this title", 409));
    }

    const newNote = await Note.create({
      title: trimmedTitle,
      content,
      category,
      tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()) : [],
      owner: req.user.userId,
    });

    return res.status(201).json({ success: true, data: serializeNote(newNote) });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, content, category, tags } = req.body;
    const note = await Note.findOne({ _id: id, owner: req.user.userId });
    if (!note) return next(new AppError("Note not found", 404));

    const nextTitle = title !== undefined ? String(title).trim() : note.title;
    const duplicate = await Note.findOne({
      owner: req.user.userId,
      _id: { $ne: id },
      title: { $regex: `^${escapeRegExp(nextTitle)}$`, $options: "i" },
    });

    if (duplicate) {
      return next(new AppError("You already have a note with this title", 409));
    }

    note.title = nextTitle;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim()) : note.tags;
    await note.save();

    return res.status(200).json({ success: true, data: serializeNote(note) });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!note) return next(new AppError("Note not found", 404));

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const uploadAttachment = (req, res, next) => {
  try {
    const id = req.params.id;
    (async () => {
      const note = await Note.findOne({ _id: id, owner: req.user.userId });

      if (!note) {
        if (req.file) fs.unlinkSync(req.file.path);
        return next(new AppError("Note not found", 404));
      }

      if (!req.file) {
        return next(new AppError("Please upload an image file", 400));
      }

      note.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };

      await note.save();

      return res.status(201).json({
        success: true,
        message: "Attachment uploaded successfully",
        data: { noteId: note._id.toString(), attachment: note.attachment },
      });
    })();
  } catch (error) {
    next(error);
  }
};

const getAttachment = (req, res, next) => {
  try {
    (async () => {
      const id = req.params.id;
      const note = await Note.findOne({ _id: id, owner: req.user.userId }).lean();

      if (!note) return next(new AppError("Note not found", 404));
      if (!note.attachment) return next(new AppError("No attachment found for this note", 404));

      const filePath = note.attachment.path || path.join(__dirname, "../uploads", note.attachment.filename);
      if (!fs.existsSync(filePath)) return next(new AppError("Attachment file not found", 404));

      res.setHeader("Content-Type", note.attachment.mimetype);
      res.setHeader("Content-Length", note.attachment.size);

      const fileStream = fs.createReadStream(filePath);
      fileStream.on("error", (error) => next(error));
      fileStream.pipe(res);
    })();
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
  getAttachment,
  getNoteStats,
};