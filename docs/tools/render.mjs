#!/usr/bin/env node
/**
 * Render architecture diagrams: docs/diagrams/src/*.mmd -> SVG and 2x PNG in docs/images/.
 * Requires mermaid-cli in <project>/temp/render-tools and a local Chrome installation.
 * Usage: node docs/tools/render.mjs [filename.mmd] [--svg-only]
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = resolve(__dirname, "..");
const PROJECT = resolve(DOCS, "..");
const SRC_DIR = join(DOCS, "diagrams", "src");
const OUT_DIR = join(DOCS, "images");
const CLI = process.env.MERMAID_CLI_PATH ?? join(PROJECT, "temp", "render-tools", "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
const CONFIG = join(__dirname, "mermaid-config.json");
const PUPPETEER_CONFIG = join(__dirname, "puppeteer-config.json");
const TARGET_WIDTH = 1400;

const arg = process.argv[2];
const svgOnly = process.argv.includes("--svg-only");

if (!existsSync(CLI)) {
  console.error("Cannot find mermaid-cli: " + CLI);
  console.error("Install first: npm install --prefix temp/render-tools --ignore-scripts @mermaid-js/mermaid-cli");
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

function normalizeSvg(file) {
  const svg = readFileSync(file, "utf8");
  const tag = /<svg[^>]*>/.exec(svg);
  if (!tag) throw new Error("Cannot read SVG root element: " + file);
  const w = / width="([\d.]+)(?:px)?"/.exec(tag[0]);
  const h = / height="([\d.]+)(?:px)?"/.exec(tag[0]);
  if (!w || !h) return null;
  const scale = TARGET_WIDTH / Number(w[1]);
  const newTag = tag[0]
    .replace(/ width="[\d.]+(?:px)?"/, ' width="' + TARGET_WIDTH + '"')
    .replace(/ height="[\d.]+(?:px)?"/, ' height="' + Math.round(Number(h[1]) * scale * 100) / 100 + '"');
  writeFileSync(file, svg.replace(tag[0], newTag));
  return { width: TARGET_WIDTH, height: Math.round(Number(h[1]) * scale * 100) / 100 };
}

const all = readdirSync(SRC_DIR).filter((f) => f.endsWith(".mmd")).sort();
const targets = arg && !arg.startsWith("--") ? [arg] : all;
const results = [];

for (const file of targets) {
  const src = join(SRC_DIR, file);
  const base = file.replace(/\.mmd$/, "");
  const svg = join(OUT_DIR, base + ".svg");
  const args = ["-i", src, "-o", svg, "-c", CONFIG, "-p", PUPPETEER_CONFIG, "-b", "white", "-q"];
  const run = spawnSync(process.execPath, [CLI, ...args], { stdio: "inherit", cwd: PROJECT });
  if (run.status !== 0) { console.log("[FAIL] " + base); continue; }
  const dim = normalizeSvg(svg);
  let png = null;
  if (!svgOnly) {
    const pngPath = join(OUT_DIR, base + ".png");
    const run2 = spawnSync(process.execPath, [CLI, "-i", src, "-o", pngPath, "-c", CONFIG, "-p", PUPPETEER_CONFIG, "-b", "white", "-s", "2", "-q"], { stdio: "inherit", cwd: PROJECT });
    if (run2.status !== 0) { console.log("[FAIL png] " + base); } else { png = pngPath; }
  }
  results.push({ base, svg: dim, png });
  console.log("[OK] " + base + "  svg=" + (dim ? dim.width + "x" + dim.height : "?") + (png ? "  png=" + TARGET_WIDTH * 2 + "w" : ""));
}

console.log("\n=== Summary ===");
for (const r of results) console.log(r.base, r.svg ? r.svg.width + "x" + r.svg.height : "-", r.png ? "png ✓" : "png ✗");
