import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { Server } from "http";
import { setupWebSocket } from "./websocket";
import { logger } from "./logger";
import { marked } from "marked";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app: Express = express();

const DOCS_DIR = path.join(__dirname, "..", "..", "docs");

function renderDoc(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — hives docs</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 20px; color: #ccc; background: #111; line-height: 1.6; }
  a { color: #7af; }
  h1, h2, h3 { color: #eee; }
  code { background: #222; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 16px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
  th { background: #1a1a1a; color: #eee; }
  nav { margin-bottom: 32px; padding-bottom: 12px; border-bottom: 1px solid #333; }
  nav a { margin-right: 16px; }
</style>
</head>
<body>
<nav><a href="/docs">← docs</a></nav>
${body}
</body>
</html>`;
}

app.get("/docs", (_req: Request, res: Response) => {
  try {
    const indexPath = path.join(DOCS_DIR, "README.md");
    const md = fs.readFileSync(indexPath, "utf8");
    const html = String(marked(md));
    const withLinks = html.replace(/href="([^"]+)\.md"/g, 'href="/docs/$1"');
    res.send(renderDoc("Documentation", withLinks));
  } catch {
    res.status(500).send("Failed to load docs index");
  }
});

app.get("/docs/:name", (req: Request, res: Response) => {
  const name = path.basename(String(req.params.name), ".md");
  const filePath = path.join(DOCS_DIR, `${name}.md`);
  if (!filePath.startsWith(DOCS_DIR)) {
    res.status(403).send("Forbidden");
    return;
  }
  try {
    const md = fs.readFileSync(filePath, "utf8");
    const html = String(marked(md));
    const withLinks = html.replace(/href="([^"]+)\.md"/g, 'href="/docs/$1"');
    res.send(renderDoc(name, withLinks));
  } catch {
    res.status(404).send("Document not found");
  }
});

app.use(express.static(path.join(__dirname, "..", "static")));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Static file error:", err);
  res.status(500).send("Error serving static file");
});

const server: Server = app.listen(PORT, () =>
  logger.info(`Listening on ${PORT}`)
);

setupWebSocket(server);
