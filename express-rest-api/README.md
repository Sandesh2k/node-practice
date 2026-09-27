# Notes REST API — Authentication

A RESTful Notes API with **JWT authentication**, password hashing, validation, and user-specific note ownership.

## Features

* User registration with hashed passwords using `bcryptjs`
* User login with JWT
* Protected Notes API using `requireAuth`
* Users can access only their own notes
* Input validation with `express-validator`
* Consistent error handling with `AppError`
* Pagination, filtering, searching, and sorting
* CORS and rate limiting
* API versioning with `/api/v1`

## Approach

1. **Register** → Validate user data → Hash password → Store user.
2. **Login** → Find user → Compare hashed password → Generate JWT.
3. **Authentication** → `requireAuth` verifies the JWT and stores user information in `req.user`.
4. **Authorization** → Notes are stored with a `userId`, and every note operation checks `note.userId === req.user.userId`.
5. **Error handling** → Authentication and application errors are passed to the central error handler with appropriate status codes.

## Authentication Flow

```text
Register
   ↓
Hash Password
   ↓
Create User

Login
   ↓
Verify Password
   ↓
Generate JWT
   ↓
Bearer Token

Protected Request
   ↓
requireAuth
   ↓
Verify JWT
   ↓
req.user
   ↓
Check note.userId
   ↓
Allow/Deny
```

## Endpoints

| Method | Endpoint            | Auth     |
| ------ | ------------------- | -------- |
| POST   | `/auth/register`    | No       |
| POST   | `/auth/login`       | No       |
| GET    | `/api/v1/notes`     | Required |
| GET    | `/api/v1/notes/:id` | Required |
| POST   | `/api/v1/notes`     | Required |
| PUT    | `/api/v1/notes/:id` | Required |
| DELETE | `/api/v1/notes/:id` | Required |

## Setup

```bash
npm install
npm start
```

Create `.env`:

```env
PORT=5000
JWT_SECRET=my_super_secret_key
JWT_EXPIRES_IN=1h
```

For protected requests, send:

```http
Authorization: Bearer <JWT_TOKEN>
```
