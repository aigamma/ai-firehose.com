/*
  Glossary cross-link integrity check.

  build_glossary.mjs resolves each authored `related:` slug to a concept and SILENTLY
  DROPS any that do not resolve (the `.filter((r) => r.label)` at the related-mesh step),
  so a typo'd or stale related slug just vanishes from the hub with no error. That is
  silent rot in the knowledge graph: the cross-link a reader expects is quietly missing.
  This surfaces it. Every authored `related:` slug must resolve to a real concept (a hub
  at public/data/glossary/c/<slug>.json, or another authored entry). The wrapping test
  fails `npm test` on a dangling cross-link, so it cannot disappear unnoticed. This is
  the doc anti-staleness discipline (see check_docs_fresh.mjs) extended to the KB.
*/
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(ROOT, "content/glossary");
const HUBS = resolve(ROOT, "public/data/glossary/c");

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

// A related slug resolves if a concept hub exists for it (the runtime link target) or
// it is another authored entry (whose hub the build will write). Returns danglers.
export function findBrokenRelated() {
  const hubs = new Set(
    existsSync(HUBS) ? readdirSync(HUBS).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)) : []
  );
  const files = existsSync(CONTENT) ? walk(CONTENT) : [];
  const entries = files.map((f) => {
    const fm = frontmatter(readFileSync(f, "utf8"));
    return { slug: fm.slug || basename(f, ".md"), related: fm.related || "" };
  });
  const valid = new Set([...hubs, ...entries.map((e) => e.slug)]);
  const broken = [];
  for (const { slug, related } of entries) {
    for (const r of related.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!valid.has(r)) broken.push({ slug, related: r });
    }
  }
  return broken.sort((a, b) => `${a.slug}${a.related}`.localeCompare(`${b.slug}${b.related}`));
}

function main() {
  const broken = findBrokenRelated();
  if (!broken.length) {
    console.log("check_glossary: OK, all related links resolve.");
    return;
  }
  console.error(`check_glossary: ${broken.length} dangling related link(s) (silently dropped by the build):`);
  for (const b of broken) console.error(`  ${b.slug}  ->  ${b.related}`);
  console.error("\nFix the related slug in content/glossary (or add the missing entry); otherwise the link is dropped from the hub mesh.");
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
