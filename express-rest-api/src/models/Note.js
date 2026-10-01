const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    attachment: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },
  },
  {
    timestamps: true,
  }
);

const trimTitle = function () {
  if (typeof this.title === "string") {
    this.title = this.title.trim();
  }
};

noteSchema.pre("validate", trimTitle);
noteSchema.pre("save", trimTitle);

noteSchema.index({ title: "text" });
noteSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);