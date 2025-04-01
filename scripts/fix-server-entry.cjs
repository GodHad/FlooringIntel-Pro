const fs = require("fs");
const path = require("path");

const serverDir = path.join(__dirname, "..", "dist", "server");
const indexFile = path.join(serverDir, "index.js");
const serverFile = path.join(serverDir, "server.js");

console.log("Checking server entry...");
console.log("serverDir:", serverDir);
console.log("indexFile:", indexFile);
console.log("serverFile:", serverFile);
console.log("serverDir exists:", fs.existsSync(serverDir));
console.log("index exists:", fs.existsSync(indexFile));
console.log("server exists:", fs.existsSync(serverFile));

if (fs.existsSync(serverDir)) {
  console.log("dist/server files:", fs.readdirSync(serverDir));
}

if (fs.existsSync(indexFile) && !fs.existsSync(serverFile)) {
  fs.copyFileSync(indexFile, serverFile);
  console.log("Created dist/server/server.js from dist/server/index.js");
} else if (fs.existsSync(serverFile)) {
  console.log("dist/server/server.js already exists");
} else {
  console.error("Cannot create dist/server/server.js because dist/server/index.js does not exist");
  process.exit(1);
}
