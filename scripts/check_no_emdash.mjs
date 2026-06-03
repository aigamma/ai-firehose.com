/*
  Writing-rule enforcement: no em dashes (U+2014) in generative text.

  CLAUDE.md's first writing rule forbids the em dash in all generative output: UI
  copy, JSX strings, code comments, Markdown docs, authored JSON, and shipped prompts.
  Until now only MODEL output was enforced (sanitized at ingest by worker/lib/text.mjs);
  authored content and code relied on manual vigilance, which does not scale as the
  knowledge base grows by AI authoring. This gate scans the authored/generative scopes
  and fails the suite on any em dash, so the rule is enforced by code, not goodwill.

  Verbatim source titles (YouTube, arXiv, and the like) are quotes, not generative text,
  and the rule explicitly leaves them intact, so the corpus artifacts under public/data
  that carry those titles are deliberately NOT scanned. En dashes (U+2013) are allowed
  for numeric ranges, so they are not checked here (distinguishing a range from prose use
  is a judgment call left to review); this gate targets only the unambiguous em dash.

  The em dash is referenced only via its code point (String.fromCharCode) so this file
  contains no literal U+2014.
*/
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EM_DASH = String.fromCharCode(0x2014);

// Generative/authored scopes the writing rule covers.
const SCOPES = [
  { dir: "content/glossary", exts: [".md"] },
  { dir: "src", exts: [".js", ".jsx", ".ts", ".tsx", ".css"] },
  { dir: "docs", exts: [".md"] },
  { dir: "worker/pipeline/prompts", exts: null }, // every shipped prompt file
];
const FILES = [
  "CLAUDE.md",
  "README.md",
  "AGENTS.md",
  "STEERING_DOCS.md",
  "LESSONS_LEARNED.md",
  "GEMINI.md",
  "opencode.md",
  "public/data/learning-paths.json",
];

// Pure: find every em dash in a blob of text, with 1-based line and column. Exported so
// the detector itself is unit-tested (not just the live tree).
export function scanText(text) {
  const hits = [];
  String(text)
    .split(/\r?\n/)
    .forEach((line, i) => {
      let idx = line.indexOf(EM_DASH);
      while (idx !== -1) {
        hits.push({ line: i + 1, col: idx + 1, excerpt: line.slice(Math.max(0, idx - 25), idx + 26).trim() });
        idx = line.indexOf(EM_DASH, idx + 1);
      }
    });
  return hits;
}

function walk(dir, exts) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (!exts || exts.includes(extname(e.name))) out.push(p);
  }
  return out;
}

export function findEmDashes() {
  const files = [];
  for (const s of SCOPES) files.push(...walk(resolve(ROOT, s.dir), s.exts));
  for (const f of FILES) {
    const p = resolve(ROOT, f);
    if (existsSync(p)) files.push(p);
  }
  const hits = [];
  for (const f of files) {
    const rel = f.slice(ROOT.length + 1).replace(/\\/g, "/");
    for (const h of scanText(readFileSync(f, "utf8"))) hits.push({ file: rel, ...h });
  }
  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col);
}

function main() {
  const hits = findEmDashes();
  if (!hits.length) {
    console.log("check_no_emdash: OK, no em dashes (U+2014) in authored generative text.");
    return;
  }
  console.error(`check_no_emdash: ${hits.length} em dash(es) (U+2014) in generative text (forbidden by the writing rule):`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}:${h.col}  ...${h.excerpt}...`);
  console.error('\nReplace each with the punctuation the sentence wants: comma, colon, semicolon, period, parentheses, or "and".');
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
