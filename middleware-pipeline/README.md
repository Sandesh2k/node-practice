# Notes REST API

A simple REST API built with Node.js and Express.

## Features

* CRUD operations for notes
* Request logging
* CORS restricted to `http://localhost:5000`
* Rate limiting
* Centralized error handling
* Custom `AppError` class
* 404 handling

## Setup

```bash
npm install
npm start
```

Server:

```text
http://localhost:5000
```

## API Endpoints

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| GET    | `/api/notes`     | Get all notes |
| GET    | `/api/notes/:id` | Get one note  |
| POST   | `/api/notes`     | Create a note |
| PUT    | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

## Example POST

```json
{
  "title": "Learn Node.js",
  "content": "Practice Express middleware"
}
```

## Middleware

### Logger

Logs:

```text
METHOD URL STATUS_CODE RESPONSE_TIME
```

### CORS

Only requests from:

```text
http://localhost:5000
```

are allowed.

### Rate Limiting

Maximum **100 requests per 15 minutes** per client.

### Error Handling

All application errors are passed to the central error handler using `AppError`.

Example:

```js
next(new AppError("Note not found", 404));
```
