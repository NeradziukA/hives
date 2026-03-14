import fs from "fs";
import path from "path";

const TEMPLATE = fs.readFileSync(path.join(__dirname, "docs-template.html"), "utf8");

export function renderDoc(title: string, body: string, nav: string): string {
  return TEMPLATE
    .replace("{{title}}", title)
    .replace("{{nav}}", nav)
    .replace("{{body}}", body);
}
