/*
  Sync the public count claims in the docs to the live generated artifacts, so the
  check_doc_accuracy gate passes without hand-editing every authoring batch. It rewrites
  exactly the lines that gate verifies (durable count, total count, category count) from
  public/data/glossary/index.json and atlas.json. The figure count (424) and gate count
  are left alone; those change rarely and are synced by hand when they do.
  Run with: node scripts/sync_doc_counts.mjs
*/
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(resolve(ROOT, p), "utf8");
const wr = (p, s) => writeFileSync(resolve(ROOT, p), s);

const index = JSON.parse(rd("public/data/glossary/index.json"));
const atlas = JSON.parse(rd("public/data/glossary/atlas.json"));
const durable = index.durable_count;
const total = index.count;
const cats = atlas.categoryCount;

const edits = [
  ["README.md", /(\*\*A durable knowledge base\.\*\* )\d+( Opus-authored concepts across )\d+/, `$1${durable}$2${cats}`],
  ["OVERVIEW.md", /\*\*\d+ authored concepts across \d+ categories\*\*/, `**${durable} authored concepts across ${cats} categories**`],
  ["OVERVIEW.md", /(\| Authored, durable knowledge-base concepts \| )\d+( \|)/, `$1${durable}$2`],
  ["OVERVIEW.md", /(\| Knowledge categories \| )\d+( \|)/, `$1${cats}$2`],
  ["OVERVIEW.md", /(\| Total concepts \(durable plus live trending\) \| )\d+( \|)/, `$1${total}$2`],
  ["docs/GLOSSARY.md", /\d+(-node hairball)/, `${durable}$1`],
  ["CLAUDE.md", /(knowledge base \()\d+( entries across )\d+( categories)/, `$1${durable}$2${cats}$3`],
  ["CLAUDE.md", /(of the )\d+( concepts carry such a figure)/, `$1${durable}$2`],
];

let n = 0;
for (const [file, re, rep] of edits) {
  const before = rd(file);
  const after = before.replace(re, rep);
  if (after !== before) { wr(file, after); n++; }
}
console.log(`sync_doc_counts: durable=${durable} total=${total} categories=${cats}; updated ${n} doc location(s).`);
