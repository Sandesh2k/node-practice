const fs = require("fs");
const path = require("path");

const directory = process.argv[2];

if (!directory) {
  console.error("Error: Please provide a directory path.");
  console.log("Usage: node src/cli.js <directory>");
  process.exit(1);
}

const absolutePath = path.resolve(directory);

if (!fs.existsSync(absolutePath)) {
  console.error(`Error: Directory does not exist: ${absolutePath}`);
  process.exit(1);
}

if (!fs.statSync(absolutePath).isDirectory()) {
  console.error(`Error: Not a directory: ${absolutePath}`);
  process.exit(1);
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    if (content.length === 0) {
      return 0;
    }

    return content.split(/\r?\n/).length;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function scanDirectory(directoryPath) {
  try {
    const entries = fs.readdirSync(directoryPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectory
        scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ) {
        const lines = countLines(fullPath);

        if (lines !== null) {
          console.log(`${fullPath} - ${lines} lines`);
        }
      }
    }
  } catch (error) {
    console.error(`Error accessing ${directoryPath}: ${error.message}`);
  }
}

console.log(`Scanning: ${absolutePath}\n`);

scanDirectory(absolutePath);