import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { marked } from "marked";
import { buildToc, renderDoc } from "./docs-render";

const DOCS_DIR = path.join(__dirname, "..", "..", "docs");

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  try {
    const md = fs.readFileSync(path.join(DOCS_DIR, "README.md"), "utf8");
    const html = String(marked(md)).replace(/href="([^"]+)\.md"/g, 'href="/docs/$1"');
    res.type("html").send(renderDoc("Documentation", buildToc(html)));
  } catch {
    res.status(500).send("Failed to load docs index");
  }
});

router.get("/*", (req: Request, res: Response) => {
  const raw = (req.params as Record<string, string>)[0] ?? "";
  const relative = raw.endsWith(".md") ? raw.slice(0, -3) : raw;
  const filePath = path.resolve(DOCS_DIR, `${relative}.md`);
  if (!filePath.startsWith(DOCS_DIR + path.sep)) {
    res.status(403).send("Forbidden");
    return;
  }
  try {
    const md = fs.readFileSync(filePath, "utf8");
    const html = String(marked(md)).replace(/href="([^"]+)\.md"/g, 'href="/docs/$1"');
    res.type("html").send(renderDoc(path.basename(relative), buildToc(html)));
  } catch {
    res.status(404).send("Document not found");
  }
});

export default router;
