/*
  Glossary and learning-path cross-link integrity check.

  build_glossary.mjs resolves each authored `related:` slug to a concept and SILENTLY
  DROPS any that do not resolve (the `.filter((r) => r.label)` at the related-mesh step),
  so a typo'd or stale related slug just vanishes from the hub with no error. That is
  silent rot in the knowledge graph. This surfaces it, and it also validates the curated
  learning paths (public/data/learning-paths.json): every related slug AND every path
  step must resolve to a real concept (a hub at public/data/glossary/c/<slug>.json, or an
  authored entry whose hub the build will write). The wrapping test fails `npm test` on a
  dangling link, so it cannot disappear unnoticed. The doc anti-staleness discipline (see
  check_docs_fresh.mjs) extended to the knowledge base and the paths that teach it.
*/
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(ROOT, "content/glossary");
const HUBS = resolve(ROOT, "public/data/glossary/c");
const PATHS = resolve(ROOT, "public/data/learning-paths.json");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

// Slugs that resolve to a real concept hub (the runtime link target) or to an authored
// entry whose hub the build will write.
function validSlugs() {
  const hubs = existsSync(HUBS) ? readdirSync(HUBS).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)) : [];
  const authored = (existsSync(CONTENT) ? walk(CONTENT) : []).map(
    (f) => frontmatter(readFileSync(f, "utf8")).slug || basename(f, ".md"),
  );
  return new Set([...hubs, ...authored]);
}

export function findBrokenRelated() {
  const valid = validSlugs();
  const files = existsSync(CONTENT) ? walk(CONTENT) : [];
  const broken = [];
  for (const f of files) {
    const fm = frontmatter(readFileSync(f, "utf8"));
    const slug = fm.slug || basename(f, ".md");
    for (const r of (fm.related || "").split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!valid.has(r)) broken.push({ slug, related: r });
    }
  }
  return broken.sort((a, b) => `${a.slug}${a.related}`.localeCompare(`${b.slug}${b.related}`));
}

// Every step of every curated learning path must resolve to a real concept, or the Learn
// page links to a hub that does not exist.
export function findBrokenPaths() {
  if (!existsSync(PATHS)) return [];
  const valid = validSlugs();
  let data;
  try {
    data = JSON.parse(readFileSync(PATHS, "utf8"));
  } catch {
    return [{ path: "(invalid JSON)", step: "learning-paths.json" }];
  }
  const broken = [];
  for (const p of data.paths || []) {
    for (const step of p.steps || []) {
      if (!valid.has(step)) broken.push({ path: p.slug || p.title || "(unnamed)", step });
    }
  }
  return broken.sort((a, b) => `${a.path}${a.step}`.localeCompare(`${b.path}${b.step}`));
}

function main() {
  const related = findBrokenRelated();
  const paths = findBrokenPaths();
  if (!related.length && !paths.length) {
    console.log("check_glossary: OK, all related links and learning-path steps resolve.");
    return;
  }
  if (related.length) {
    console.error(`check_glossary: ${related.length} dangling related link(s) (silently dropped by the build):`);
    for (const b of related) console.error(`  related  ${b.slug}  ->  ${b.related}`);
  }
  if (paths.length) {
    console.error(`check_glossary: ${paths.length} dangling learning-path step(s):`);
    for (const b of paths) console.error(`  path ${b.path}  ->  ${b.step}`);
  }
  console.error("\nFix the slug to a real concept (or add the missing entry); otherwise the link is dead.");
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
