import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/*
  Emit the explicit glossary onboarding backlog as a human-skimmable, committed doc.

  The live source of truth is public/data/glossary/index.json: every concept without
  `durable: true` is a prospect (a corpus-discovered tag that still needs a durable
  authored entry). This script snapshots that set, sorted by attention (so the
  board-visible head is at the top), into docs/glossary_backlog.md, so the work queue
  is an agent-visible AND human-curatable document, not only a query. Re-run after each
  authoring batch to refresh it. See docs/GLOSSARY_ONBOARDING.md for the procedure.
*/

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const idx = JSON.parse(readFileSync(resolve(ROOT, "public/data/glossary/index.json"), "utf8"));
// Sanitize: strip any em dash from a corpus-derived label so this generated doc cannot
// trip the no-em-dash gate (the labels are AI-discovered, not authored prose).
const clean = (s) => String(s || "").replace(/—/g, ", ").replace(/\s+/g, " ").trim();
const todo = (idx.concepts || []).filter((c) => !c.durable).sort(
  (a, b) => (b.attention || 0) - (a.attention || 0) || String(a.id).localeCompare(String(b.id)),
);

const out = [
  "# Glossary Onboarding Backlog (auto-generated prospect list)",
  "",
  "> This is the explicit list of glossary prospects: every corpus-discovered concept that does",
  "> NOT yet have a durable authored entry, sorted by attention (descending, so the board-visible",
  "> head is at the top). It is the work queue for the campaign in docs/GLOSSARY_ONBOARDING.md.",
  "> Vendor and product tools (Ollama, OpenRouter, DeepSeek, and so on) ARE in scope, written as",
  "> short educational entries; only pure non-AI dev terms (for example form-submission) are skipped.",
  ">",
  "> Auto-generated. Regenerate after authoring with: node scripts/build_glossary_backlog.mjs",
  "> Live source of truth: public/data/glossary/index.json (every non-durable concept).",
  "",
  `Total prospects remaining: ${todo.length}.`,
  "",
  "| # | attention | kind | slug | label |",
  "|---|---|---|---|---|",
  ...todo.map((c, i) => `| ${i + 1} | ${c.attention || 0} | ${clean(c.kind)} | ${clean(c.id)} | ${clean(c.label)} |`),
  "",
];
writeFileSync(resolve(ROOT, "docs/glossary_backlog.md"), out.join("\n"));
console.log(`build_glossary_backlog: wrote docs/glossary_backlog.md with ${todo.length} prospects.`);
