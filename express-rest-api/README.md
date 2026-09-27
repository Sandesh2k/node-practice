# Notes REST API

A RESTful Notes API built with **Node.js and Express**.

## Features

* RESTful resource-oriented URLs
* CRUD operations using HTTP verbs
* API versioning with `/api/v1`
* Pagination using `limit` and `offset`
* Filtering, searching, and sorting with query parameters
* Input validation using `express-validator`
* Consistent error response format
* Custom `AppError` with status codes
* Centralized error handling
* Request logging with response time
* CORS restricted to `http://localhost:3000`
* Rate limiting using `express-rate-limit`

## Endpoints

| Method | Endpoint            | Description   |
| ------ | ------------------- | ------------- |
| GET    | `/api/v1/notes`     | Get notes     |
| GET    | `/api/v1/notes/:id` | Get a note    |
| POST   | `/api/v1/notes`     | Create a note |
| PUT    | `/api/v1/notes/:id` | Update a note |
| DELETE | `/api/v1/notes/:id` | Delete a note |

## Query Examples

```text
/api/v1/notes?limit=2&offset=0
/api/v1/notes?category=backend
/api/v1/notes?search=node
/api/v1/notes?sortBy=title&order=asc
```

## Setup

```bash
npm install
npm start
```

Server:

```text
http://localhost:5000
```

## Validation & Errors

Validation errors return `422`, missing resources return `404`, conflicts return `409`, and unexpected errors return `500` usi
