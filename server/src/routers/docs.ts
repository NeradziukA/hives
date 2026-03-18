import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { marked } from "marked";
import { renderDoc } from "../docs-render";

const DOCS_DIR = path.join(__dirname, "..", "..", "..", "docs");

const router = Router();

function rewriteLinks(md: string, baseDir: string): string {
  return String(marked(md)).replace(/href="([^"]+)\.md"/g, (_m, p1) => {
    const resolved = path.posix.resolve(baseDir, p1);
    return `href="/docs${resolved}"`;
  });
}

const label = (name: string) =>
  name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

function buildNavTree(dir: string, urlBase: string, current: string, depth: number): string {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return "";
  }

  const files = entries
    .filter(e => e.isFile() && e.name.endsWith(".md") && e.name !== "README.md")
    .sort((a, b) => a.name.localeCompare(b.name));

  const subdirs = entries
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const pad = 20 + depth * 12;
  let html = "";

  for (const f of files) {
    const slug = f.name.slice(0, -3);
    const href = urlBase ? `${urlBase}/${slug}` : slug;
    const active = current === href ? ' class="active"' : "";
    html += `<li${active}><a href="/docs/${href}" style="padding-left:${pad}px">${label(slug)}</a></li>\n`;
  }

  for (const d of subdirs) {
    const subBase = urlBase ? `${urlBase}/${d.name}` : d.name;
    const isOpen = current === subBase || current.startsWith(subBase + "/");
    const inner = buildNavTree(path.join(dir, d.name), subBase, current, depth + 1);
    if (!inner) continue;
    html += `<li class="nav-folder"><details${isOpen ? " open" : ""}><summary style="padding-left:${pad}px">${label(d.name)}</summary><ul>${inner}</ul></details></li>\n`;
  }

  return html;
}

function buildDocNav(current: string): string {
  const homeActive = current === "" ? ' class="active"' : "";
  let items = `<li${homeActive}><a href="/docs" style="padding-left:20px">Home</a></li>\n`;
  items += buildNavTree(DOCS_DIR, "", current, 0);
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
