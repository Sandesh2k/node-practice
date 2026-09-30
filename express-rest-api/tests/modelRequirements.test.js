import { describe, expect, it } from "vitest";

import Note from "../src/models/Note.js";
import User from "../src/models/User.js";

describe("Mongoose model requirements", () => {
  it("stores notes by owner and trims titles before saving", async () => {
    expect(Note.schema.paths.owner).toBeDefined();
    expect(Note.schema.paths.userId).toBeUndefined();
    expect(Note.schema.paths.title.options.trim).toBe(true);

    const note = new Note({
      owner: "66f8c9d1d1e3e50ea9d0d1d6",
      title: "  Example Note  ",
      content: "Body",
      category: "general",
      tags: ["alpha", "beta"],
    });

    await note.validate();
    expect(note.title).toBe("Example Note");
  });

  it("stores hashed passwords in passwordHash", () => {
    expect(User.schema.paths.passwordHash).toBeDefined();
    expect(User.schema.paths.password).toBeUndefined();
  });
});
