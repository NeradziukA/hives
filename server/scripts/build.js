const { execSync } = require("child_process");
const fs = require("fs");

execSync(`node "${require.resolve("typescript/bin/tsc")}"`, { stdio: "inherit" });
fs.copyFileSync("src/docs-template.html", "dist/docs-template.html");
fs.cpSync("src/templates", "dist/templates", { recursive: true });
