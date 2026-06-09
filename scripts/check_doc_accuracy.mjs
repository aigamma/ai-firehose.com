/*
  Semantic doc-accuracy checks for facts that are easy to let drift without a
  stale-path failure: model tier names and public count claims.
*/
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MODELS } from "../worker/lib/anthropic.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

function lineOf(text, pattern) {
  return text.split(/\r?\n/).find((line) => pattern.test(line)) || "";
}

export function expectedCounts() {
  const index = json("public/data/glossary/index.json");
  const atlas = json("public/data/glossary/atlas.json");
  const gates = readdirSync(resolve(ROOT, "scripts")).filter((f) => /^check_.*\.mjs$/.test(f) && !f.endsWith(".test.mjs")).length;
  return {
    durable: index.durable_count,
    total: index.count,
    categories: atlas.categoryCount,
    gates,
  };
}

export function findBadCountClaims() {
  const c = expectedCounts();
  const claims = [
    { file: "README.md", pattern: /durable knowledge base/i, expected: [c.durable, c.categories] },
    { file: "OVERVIEW.md", pattern: /authored concepts across/i, expected: [c.durable, c.categories] },
    { file: "OVERVIEW.md", pattern: /Authored, durable knowledge-base concepts/i, expected: [c.durable] },
    { file: "OVERVIEW.md", pattern: /Knowledge categories/i, expected: [c.categories] },
    // The durable count (644) is authored and stable, so it is gated. The combined
    // durable-plus-live-trending total is NOT gated: it changes with the corpus on every
    // scheduled ingestion, so pinning an exact number here would red CI on every worker
    // push (the Session 22/25 drift). The OVERVIEW row states it qualitatively instead.
    { file: "OVERVIEW.md", pattern: /Anti-staleness CI gates/i, expected: [c.gates] },
    { file: "docs/GLOSSARY.md", pattern: /node hairball/i, expected: [c.durable] },
    { file: "CLAUDE.md", pattern: /concepts carry such a figure/i, expected: [c.durable] },
    { file: "CLAUDE.md", pattern: /committed checker scripts/i, expected: [c.gates] },
  ];

  const bad = [];
  for (const claim of claims) {
    const line = lineOf(read(claim.file), claim.pattern);
    if (!line) {
      bad.push({ file: claim.file, reason: "missing claim line", expected: claim.expected.join(", ") });
      continue;
    }
    const nums = [...line.matchAll(/\b\d+\b/g)].map((m) => Number(m[0]));
    for (const n of claim.expected) {
      if (!nums.includes(n)) bad.push({ file: claim.file, line: line.trim(), expected: n, found: nums });
    }
  }
  return bad;
}

export function findBadModelTierClaims() {
  const text = read("CLAUDE.md").toLowerCase();
  return Object.entries(MODELS)
    .map(([tier, model]) => {
      const family = model.match(/claude-([a-z]+)-/)?.[1];
      return { tier, family, model };
    })
    .filter(({ tier, family }) => !text.includes(`\`${tier}\``) || (family && !text.includes(family)));
}

function main() {
  const counts = findBadCountClaims();
  const models = findBadModelTierClaims();
  if (!counts.length && !models.length) {
    console.log("check_doc_accuracy: OK, count claims and model tier claims match current artifacts.");
    return;
  }
  if (counts.length) {
    console.error("check_doc_accuracy: stale or missing count claim(s):");
    for (const b of counts) console.error(`  ${b.file}: expected ${b.expected}; found ${JSON.stringify(b.found ?? b.reason)} in ${b.line || "(missing)"}`);
  }
  if (models.length) {
    console.error("check_doc_accuracy: model tier claim(s) missing from CLAUDE.md:");
    for (const m of models) console.error(`  ${m.tier}: ${m.model}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
