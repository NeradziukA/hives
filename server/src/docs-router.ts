import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { marked } from "marked";
import { renderDoc } from "./docs-render";

const DOCS_DIR = path.join(__dirname, "..", "..", "docs");

const router = Router();

function rewriteLinks(md: string, baseDir: string): string {
  return String(marked(md)).replace(/href="([^"]+)\.md"/g, (_m, p1) => {
    const resolved = path.posix.resolve(baseDir, p1);
    return `href="/docs${resolved}"`;
  });
}

function buildDocNav(current: string): string {
  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
  const rootFiles = entries
    .filter(e => e.isFile() && e.name.endsWith(".md") && e.name !== "README.md")
    .map(e => e.name.slice(0, -3));
  const dirs = entries
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(e => ({
      name: e.name,
      files: fs.readdirSync(path.join(DOCS_DIR, e.name))
        .filter(f => f.endsWith(".md"))
        .map(f => f.slice(0, -3)),
    }));

  const label = (name: string) =>
    name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const link = (href: string, name: string) => {
    const active = current === href ? ' class="active"' : "";
    return `<li${active}><a href="/docs/${href}">${label(name)}</a></li>`;
  };

  let items = `<li${current === "" ? ' class="active"' : ""}><a href="/docs">Home</a></li>\n`;
  for (const f of rootFiles) items += link(f, f) + "\n";
  for (const dir of dirs) {
    items += `<li class="nav-section">${label(dir.name)}</li>\n`;
    for (const f of dir.files) items += link(`${dir.name}/${f}`, f) + "\n";
  }
  return `<nav class="docs-nav"><ul>${items}</ul></nav>`;
}

router.get("/", (_req: Request, res: Response) => {
  try {
    const md = fs.readFileSync(path.join(DOCS_DIR, "README.md"), "utf8");
    const html = rewriteLinks(md, "/");
    res.type("html").send(renderDoc("Documentation", html, buildDocNav("")));
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
    const baseDir = "/" + path.posix.dirname(relative);
    const html = rewriteLinks(md, baseDir);
    res.type("html").send(renderDoc(path.basename(relative), html, buildDocNav(relative)));
  } catch {
    res.status(404).send("Document not found");
  }
});

export default router;
