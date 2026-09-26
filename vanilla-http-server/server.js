const http = require("http");

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Hello</h1>");
    return;
  }

  if (method === "GET" && url === "/json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (method === "POST" && url === "/echo") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const jsonBody = JSON.parse(body);

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify(jsonBody));
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify({
          error: "Invalid JSON",
        }));
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});