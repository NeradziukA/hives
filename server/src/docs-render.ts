import fs from "fs";
import path from "path";

const TEMPLATE = fs.readFileSync(path.join(__dirname, "docs-template.html"), "utf8");

export function buildToc(html: string): string {
  const headings: { level: number; id: string; text: string }[] = [];
  const seen: Record<string, number> = {};

  html = html.replace(/<h([23])>(.*?)<\/h\1>/gi, (_m, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const base = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    seen[base] = (seen[base] ?? 0) + 1;
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base;
    headings.push({ level: Number(level), id, text });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  if (headings.length < 2) return html;

  const items = headings
    .map(h => `${"  ".repeat(h.level - 2)}<li><a href="#${h.id}">${h.text}</a></li>`)
    .join("\n");

  return `<nav class="toc"><strong>Contents</strong><ul>\n${items}\n</ul></nav>` + html;
}

export function renderDoc(title: string, body: string): string {
  return TEMPLATE.replace("{{title}}", title).replace("{{body}}", body);
}
