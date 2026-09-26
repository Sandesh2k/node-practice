# Node.js File Reader CLI

A simple Node.js CLI that recursively scans a directory and counts lines in `.js` and `.ts` files.

## Features

* Accepts a directory path as a command-line argument
* Recursively scans subdirectories
* Finds `.js` and `.ts` files
* Displays each file path and line count
* Handles invalid paths and file errors gracefully
* Uses only Node.js core modules

## Run

```bash
node src/cli.js ./test-folder
```

Or:

```bash
npm start -- ./test-folder
```

## Example Output

```text
Scanning: /home/sandesh.kandalkar/Downloads/Frontend/node/file-reader-cli/test-folder

/home/sandesh.kandalkar/Downloads/Frontend/node/file-reader-cli/test-folder/app.js - 7 lines
/home/sandesh.kandalkar/Downloads/Frontend/node/file-reader-cli/test-folder/server.ts - 16 lines
/home/sandesh.kandalkar/Downloads/Frontend/node/file-reader-cli/test-folder/utils/helper.js - 12 lines
/home/sandesh.kandalkar/Downloads/Frontend/node/file-reader-cli/test-folder/utils/types.ts - 11 lines

```

## Core Modules Used

* `fs` — file and directory operations
* `path` — path handling
* `process` — command-line arguments
