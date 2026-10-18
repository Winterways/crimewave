// Wraps game.html (the artifact-style fragment) into a standalone index.html,
// and copies it to dist/ for the desktop shell. Portable: `node build.js`.
const fs = require("fs"), path = require("path");
const root = __dirname;
const src = fs.readFileSync(path.join(root, "game.html"), "utf8");
const cut = src.indexOf("</style>") + "</style>".length;
const head = src.slice(0, cut), body = src.slice(cut).replace(/^\r?\n/, "");
const html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}</body>\n</html>\n`;
fs.writeFileSync(path.join(root, "index.html"), html);
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "index.html"), html);
console.log("built index.html and dist/index.html");
