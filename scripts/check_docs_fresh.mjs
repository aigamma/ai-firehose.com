/*
  Doc anti-staleness check.

  The durable-docs protocol (CLAUDE.md) says a working tree where the docs lie is
  a process failure, no different from code that lies. This makes that rule
  enforceable: it scans the CURRENT-STATE docs for backtick-quoted source paths
  and `npm run` scripts and asserts each still exists in the committed tree. The
  wrapping test (check_docs_fresh.test.mjs) fails `npm test` on any NEW stale
  reference, so a commit cannot quietly land drift. The docs become continuously
  tested against the real tree: an oracle, not a promise.

  Judged against the COMMITTED tree (`git ls-files`), not the local filesystem, on
  purpose: an untracked or gitignored path (an empty rag/ dir, a built dist/, a
  worker/.cache/) exists locally but not in a fresh CI clone, so a filesystem check
  would pass locally and fail CI, the exact never-green trap.

  Scope, on purpose:
   - Only docs that describe the PRESENT (CLAUDE.md, AGENTS.md, the map, README,
     the cross-vendor pointers, the tier-2 docs/). The append-only HISTORY logs
     (LESSONS_LEARNED.md, docs/INGESTION_LOG.md) are excluded: they describe past
     changes and legitimately name files later deleted. Checking them would punish
     honest history.
   - Only concrete committed source paths under the known top-level trees, skipping
     templated paths (< > * { } | or whitespace) and generated/ignored trees. Better
     to under-flag than cry wolf: a noisy check gets ignored and protects nothing.

  Baseline ratchet: scripts/docs_stale_baseline.json lists refs that are ALREADY
  stale (tracked debt). The test fails only on refs NOT in that list, so new drift
  is blocked immediately while the existing debt is burned down separately. Do NOT
  add to the baseline to silence a fresh break; fix the doc. Regenerate after a
  genuine burn-down with: node scripts/check_docs_fresh.mjs --write-baseline
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = resolve(ROOT, "scripts/docs_stale_baseline.json");

const KNOWN_TOPS = [
  "src/", "worker/", "rag/", "scripts/", "netlify/", "sources/",
  "docs/", "content/", "public/", ".github/", ".cursor/",
];
const SKIP_PREFIX = ["dist/", "node_modules/", ".vite/", "worker/.cache/", "coverage/"];
const TEMPLATED = /[<>*{}|\s`]/;

// The committed tree is what CI sees, so judge against it (not local disk).
function trackedPaths() {
  const out = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  return out.split("\n").filter(Boolean);
}
function makeExists(tracked) {
  const set = new Set(tracked);
  return (ref) => {
    const clean = ref.replace(/\/$/, "");
    if (set.has(clean)) return true; // a committed file
    const pre = `${clean}/`;
    return tracked.some((p) => p.startsWith(pre)); // a directory of committed files
  };
}

// Current-state docs only. History logs excluded by design (see header).
export function docFiles() {
  const fixed = [
    "CLAUDE.md", "AGENTS.md", "STEERING_DOCS.md", "README.md", "OVERVIEW.md",
    "GEMINI.md", "opencode.md",
    ".github/copilot-instructions.md", ".cursor/rules/project-context.mdc",
  ];
  const docsDir = resolve(ROOT, "docs");
  const tier2 = existsSync(docsDir)
    ? readdirSync(docsDir).filter((f) => f.endsWith(".md") && f !== "INGESTION_LOG.md").map((f) => `docs/${f}`)
    : [];
  return [...fixed, ...tier2].filter((rel) => existsSync(resolve(ROOT, rel)));
}

function isPathCandidate(tok) {
  if (!tok || TEMPLATED.test(tok)) return false;
  if (!tok.includes("/")) return false;
  if (tok.includes(".env")) return false;
  if (SKIP_PREFIX.some((p) => tok.startsWith(p))) return false;
  return KNOWN_TOPS.some((p) => tok.startsWith(p));
}

export function findStaleRefs() {
  const exists = makeExists(trackedPaths());
  const scripts = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")).scripts || {};
  const broken = [];
  for (const rel of docFiles()) {
    const text = readFileSync(resolve(ROOT, rel), "utf8");
    for (const m of text.matchAll(/`([^`\n]+)`/g)) {
      const tok = m[1].trim().replace(/[.,;:]+$/, "");
      if (!isPathCandidate(tok)) continue;
      if (!exists(tok)) broken.push({ doc: rel, ref: tok, kind: "path" });
    }
    for (const m of text.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)) {
      if (!(m[1] in scripts)) broken.push({ doc: rel, ref: `npm run ${m[1]}`, kind: "script" });
    }
  }
  const uniq = [...new Map(broken.map((b) => [`${b.doc}::${b.ref}`, b])).values()];
  return uniq.sort((a, b) => `${a.doc}${a.ref}`.localeCompare(`${b.doc}${b.ref}`));
}

export function baseline() {
  if (!existsSync(BASELINE)) return new Set();
  try { return new Set(JSON.parse(readFileSync(BASELINE, "utf8")).known || []); } catch { return new Set(); }
}
const keyOf = (b) => `${b.doc}::${b.ref}`;
export function findNewStaleRefs() {
  const known = baseline();
  return findStaleRefs().filter((b) => !known.has(keyOf(b)));
}

function main() {
  if (process.argv.includes("--write-baseline")) {
    const known = findStaleRefs().map(keyOf);
    writeFileSync(
      BASELINE,
      `${JSON.stringify({
        _comment: "Doc references that are ALREADY stale, tracked as debt to burn down (see the 'Burn down baselined stale doc refs' task). The check fails on any NEW ref not listed here. Do NOT add entries to silence a fresh break; fix the doc instead.",
        known,
      }, null, 2)}\n`,
    );
    console.log(`check_docs_fresh: wrote ${known.length} baselined refs to scripts/docs_stale_baseline.json`);
    return;
  }
  const all = findStaleRefs();
  const known = baseline();
  const fresh = all.filter((b) => !known.has(keyOf(b)));
  const debt = all.filter((b) => known.has(keyOf(b)));
  if (debt.length) console.log(`check_docs_fresh: ${debt.length} baselined stale ref(s) still owed (tracked debt).`);
  if (!fresh.length) {
    console.log("check_docs_fresh: OK, no NEW stale doc references.");
    return;
  }
  console.error(`check_docs_fresh: ${fresh.length} NEW stale doc reference(s):`);
  for (const b of fresh) console.error(`  [${b.kind}] ${b.doc}  ->  ${b.ref}`);
  console.error("\nA current-state doc names something not in the committed tree. Fix the doc to match, or restore the file.");
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
