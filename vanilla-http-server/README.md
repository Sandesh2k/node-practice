# Vanilla HTTP Server

A simple HTTP server built using **Node.js's built-in `http` module** without Express.

## Features

1. `GET /` → Returns HTML `Hello`
2. `GET /json` → Returns JSON `{ "ok": true }`
3. `POST /echo` → Accepts JSON and echoes it back

## Tech Stack

* Node.js
* Built-in `http` module

## Run

```bash
node server.js
```

Server runs at:

```text
http://localhost:3001
```

## Test

```bash
curl http://localhost:3001/
curl http://localhost:3001/json

curl -X POST http://localhost:3001/echo \
  -H "Content-Type: application/json" \
  -d '{"name":"Sandesh"}'
```
