import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../frontend/dist/clientcore/browser", import.meta.url));
const port = Number(process.env.FRONTEND_PORT ?? 4200);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"]
]);

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = normalize(join(root, pathname));
  if (!requested.startsWith(root)) {
    return join(root, "index.html");
  }
  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested;
  }
  return join(root, "index.html");
}

createServer((request, response) => {
  const filePath = resolvePath(request.url ?? "/");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", contentTypes.get(extname(filePath)) ?? "application/octet-stream");
  createReadStream(filePath)
    .on("error", () => {
      response.writeHead(500);
      response.end("Unable to read asset");
    })
    .pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`ClientCore frontend listening on http://localhost:${port}`);
});
