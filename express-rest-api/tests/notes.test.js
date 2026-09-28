import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../src/app.js";
import users from "../src/data/users.js";
import notes from "../src/data/notes.js";

describe("Notes API", () => {
    beforeEach(() => {
        users.length = 0;
        notes.length = 0;
    });

    describe("Register → Login → Create Note → Read Note", () => {
        it("should complete the full authenticated note flow", async () => {
            // 1. Register
            const registerResponse = await request(app)
                .post("/auth/register")
                .send({
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123",
                });

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.success).toBe(true);

            // 2. Login
            const loginResponse = await request(app)
                .post("/auth/login")
                .send({
                    email: "test@example.com",
                    password: "password123",
                });


            // console.log("LOGIN RESPONSE:", loginResponse.body);

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.success).toBe(true);

            const token = loginResponse.body.token;

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");

            // 3. Create note
            const createResponse = await request(app)
                .post("/api/v1/notes")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Note",
                    content: "This is a test note",
                    category: "testing",
                });

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.success).toBe(true);

            const createdNote = createResponse.body.data;

            expect(createdNote.title).toBe("Test Note");
            expect(createdNote.content).toBe("This is a test note");
            expect(createdNote.userId).toBeDefined();

            // 4. Read note
            const readResponse = await request(app)
                .get(`/api/v1/notes/${createdNote.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(readResponse.status).toBe(200);
            expect(readResponse.body.success).toBe(true);

            const readNote = readResponse.body.data;

            expect(readNote.id).toBe(createdNote.id);
            expect(readNote.title).toBe("Test Note");
            expect(readNote.content).toBe("This is a test note");
            expect(readNote.userId).toBe(createdNote.userId);
        });
    });

    describe("Authentication", () => {
        it("should reject requests without a token", async () => {
            const response = await request(app)
                .get("/api/v1/notes");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should reject requests with an invalid token", async () => {
            const response = await request(app)
                .get("/api/v1/notes")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("User ownership", () => {
        it("should reject another user's access to a note", async () => {

            // Register User 1
            await request(app)
                .post("/auth/register")
                .send({
                    name: "User One",
                    email: "user1@example.com",
                    password: "password123",
                });

            // Login User 1
            const user1Login = await request(app)
                .post("/auth/login")
                .send({
                    email: "user1@example.com",
                    password: "password123",
                });

            const user1Token = user1Login.body.token;

            // User 1 creates a note
            const noteResponse = await request(app)
                .post("/api/v1/notes")
                .set("Authorization", `Bearer ${user1Token}`)
                .send({
                    title: "Private Note",
                    content: "User 1 private content",
                    category: "private",
                });

            expect(noteResponse.status).toBe(201);

            const noteId = noteResponse.body.data.id;

            // Register User 2
            await request(app)
                .post("/auth/register")
                .send({
                    name: "User Two",
                    email: "user2@example.com",
                    password: "password123",
                });

            // Login User 2
            const user2Login = await request(app)
                .post("/auth/login")
                .send({
                    email: "user2@example.com",
                    password: "password123",
                });

            const user2Token = user2Login.body.token;

            // User 2 tries to access User 1's note
            const response = await request(app)
                .get(`/api/v1/notes/${noteId}`)
                .set("Authorization", `Bearer ${user2Token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe("Note not found");
        });
    });
});