/*
  Build the live harness snapshot: public/data/harness.json.

  This project is itself an agentic harness, the scaffolding that lets an agent or
  a fleet keep a knowledge-and-ingestion system fresh without a human in the loop
  at every step. This generator reads the repository's OWN current state, so the
  /harness page is a living, non-idempotent demonstration: it changes every time
  the harness does its job (a lesson learned, a concept authored, a gate added).
  Runs in prebuild, so every deploy reflects the tree as committed.

  Pure of network and keys; reads files only. Robust: any missing input falls back
  to a safe default so a build never breaks here.

  Run: node scripts/build_harness.mjs
*/
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = resolve(ROOT, "public/data");

const readJson = (rel, fallback) => {
  try { return JSON.parse(readFileSync(resolve(ROOT, rel), "utf8")); } catch { return fallback; }
};
const readText = (rel) => {
  try { return readFileSync(resolve(ROOT, rel), "utf8"); } catch { return ""; }
};
const listDir = (rel) => {
  try { return readdirSync(resolve(ROOT, rel)); } catch { return []; }
};
// Manual recursive walk (no reliance on the readdirSync recursive option, so any
// Node 20 runs it). Returns absolute file paths.
function walk(rel) {
  const out = [];
  const rec = (dir) => {
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = resolve(dir, e.name);
      if (e.isDirectory()) rec(full);
      else out.push(e.name);
    }
  };
  rec(resolve(ROOT, rel));
  return out;
}

const index = readJson("public/data/glossary/index.json", { count: 0, durable_count: 0 });
const atlas = readJson("public/data/glossary/atlas.json", { categoryCount: 0, edges: [] });
const stats = readJson("public/data/stats.json", { total_items: 0, concepts: 0, by_source: {} });

// Source adapters: every worker/sources/*.mjs except the aggregator, the channel
// registry, and any test file.
const sourceAdapters = listDir("worker/sources").filter(
  (f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs") && f !== "index.mjs" && f !== "youtube_registry.mjs"
);
// Anti-staleness gates: scripts/check_*.mjs (not their tests).
const gates = listDir("scripts").filter((f) => /^check_.*\.mjs$/.test(f) && !f.endsWith(".test.mjs"));
// Tier-2 subsystem docs (the append-only run log is excluded by design).
const tier2 = listDir("docs").filter((f) => f.endsWith(".md") && f !== "INGESTION_LOG.md");
// Automated checks: every node:test file the suite runs.
const testFiles = [...walk("worker"), ...walk("scripts")].filter((f) => f.endsWith(".test.mjs"));
// Cross-vendor pointer files that delegate to CLAUDE.md.
const vendorPointers = [
  "AGENTS.md", "GEMINI.md", "opencode.md",
  ".github/copilot-instructions.md", ".cursor/rules/project-context.mdc",
].filter((p) => existsSync(resolve(ROOT, p)));

// Lessons: count the "## Session N" entries and surface the most recent heading.
const sessionHeads = [...readText("LESSONS_LEARNED.md").matchAll(/^##\s+Session\s+\d+[^\n]*/gm)]
  .map((m) => m[0].replace(/^##\s+/, "").trim());

const metrics = {
  durable_concepts: index.durable_count || 0,
  index_entries: index.count || 0,
  categories: atlas.categoryCount || 0,
  cross_category_links: (atlas.edges || []).length,
  corpus_items: stats.total_items || 0,
  corpus_concepts: stats.concepts || 0,
  source_adapters: sourceAdapters.length,
  staleness_gates: gates.length,
  automated_checks: testFiles.length,
  tier2_docs: tier2.length,
  vendor_pointers: vendorPointers.length,
  lessons_sessions: sessionHeads.length,
};

const harness = {
  generated: new Date().toISOString().slice(0, 10),
  latest_lesson: sessionHeads[0] || null,
  metrics,
  pillars: [
    {
      key: "conventions",
      title: "Conventions It Auto-Loads",
      count: vendorPointers.length + 1,
      unit: "entry points",
      body: "A new agent in any tool inherits the same rules. CLAUDE.md is auto-loaded as the canonical guide; AGENTS.md and the per-vendor pointer files (Cursor, Copilot, OpenCode, Gemini) delegate to it, so there is one source of truth and no drift.",
    },
    {
      key: "memory",
      title: "Persistent Memory That Does Not Decay",
      count: sessionHeads.length,
      unit: "logged sessions",
      body: "Session chat is forgotten; the repository is not. Every durable lesson is appended to LESSONS_LEARNED.md, every plan to the ROADMAP, every run to the ingestion log. The rule is to route an insight to the right file before the turn ends, so the next agent starts where the last one stopped.",
    },
    {
      key: "gates",
      title: "Automated Anti-Staleness Gates",
      count: gates.length,
      unit: "gates",
      body: "The durable-docs rule is enforced by code, not goodwill. Committed checks fail the build if a doc names a file that does not exist, if a knowledge-graph cross-link dangles, or if a forbidden em dash slips into authored prose. A working tree where the docs lie does not merge.",
    },
    {
      key: "fanout",
      title: "Multi-Agent Fan-Out On Idempotent Contracts",
      count: sourceAdapters.length,
      unit: "source adapters",
      body: "Work parallelizes across many agents because the contracts are deterministic and idempotent: content-hash vector ids, a pinned precompute, a self-expiring corpus. Ten agents can author the glossary at once, or one can rebuild every artifact offline, and the output is the same.",
    },
    {
      key: "knowledge",
      title: "The Durable Layer It Keeps Fresh",
      count: index.durable_count || 0,
      unit: "authored concepts",
      body: "All of the above exists to maintain something: a permanent, authored knowledge base woven into the live trending corpus, that the retention prune never touches and every deploy rebuilds. The harness is the gardener; this is the garden.",
    },
  ],
};

mkdirSync(DATA, { recursive: true });
writeFileSync(resolve(DATA, "harness.json"), `${JSON.stringify(harness, null, 2)}\n`);
console.log(
  `build_harness: ${sessionHeads.length} sessions, ${gates.length} gates, ${sourceAdapters.length} sources, ${testFiles.length} test files, ${index.durable_count} durable concepts -> public/data/harness.json`
);
