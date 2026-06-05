import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEntry } from "./build_glossary.mjs";
import { buildDurableSurfaceMap, buildFoldMap } from "./lib/fold.mjs";

/*
  One-time migration: fold corpus-discovered duplicate concepts onto the durable
  glossary, on the committed snapshot.

  The worker's resolver does not yet dedupe discovered concepts against the durable
  layer (a fix tracked for worker/pipeline/concepts.mjs), so the served snapshot
  carries ~one thin hub per surface variant ("AI agents", "LLMs", "large language
  models") instead of collapsing them onto the rich authored hub. This routes each
  duplicate to its durable concept: it merges the duplicate's attention and items
  into the authored hub, leaves a redirect stub at the old slug so links and neighbor
  refs still resolve, drops the duplicate from the index, and de-fragments the trend
  boards so one concept is one row.

  Idempotent: once a duplicate is removed from the index it is never reprocessed, so a
  re-run no-ops. build_glossary (prebuild) preserves the folded state because it reads
  the deduped index and rewrites each durable hub from its prior (already-summed) data.
  Run with: node scripts/fold_corpus_concepts.mjs
*/

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CONTENT = resolve(ROOT, "content/glossary");
const GDATA = resolve(ROOT, "public/data/glossary");
const ADATA = resolve(ROOT, "public/data/attention");

const readJson = (p, fb) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fb; } };
const writeJson = (p, o) => writeFileSync(p, `${JSON.stringify(o, null, 2)}\n`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".md") && name.toLowerCase() !== "readme.md") out.push(p);
  }
  return out;
}

function dedupBy(arr, keyFn, cap) {
  const seen = new Set();
  const out = [];
  for (const x of arr || []) {
    const k = keyFn(x);
    if (k == null || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
    if (cap && out.length >= cap) break;
  }
  return out;
}

export function foldCorpus({ gdata = GDATA, adata = ADATA, content = CONTENT } = {}) {
  const entries = [];
  for (const f of existsSync(content) ? walk(content) : []) {
    const e = parseEntry(readFileSync(f, "utf8"));
    if (e) entries.push({ slug: e.slug, title: e.title, aliases: e.aliases });
  }
  const titleBySlug = new Map(entries.map((e) => [e.slug, e.title]));
  const { surface } = buildDurableSurfaceMap(entries);

  const index = readJson(resolve(gdata, "index.json"), { concepts: [] });
  const corpus = (index.concepts || []).filter((c) => !c.durable);
  const { foldMap, report } = buildFoldMap(surface, corpus);
  const foldKeys = new Set(Object.keys(foldMap));
  if (!foldKeys.size) {
    console.log("fold_corpus: nothing to fold (already folded, or no duplicates of durable concepts).");
    return { folded: 0, foldMap: {}, report: [] };
  }

  // 1) Merge each duplicate's attention and items into its durable hub; leave a
  //    redirect stub at the old slug so links and neighbor refs still resolve.
  for (const [from, to] of Object.entries(foldMap)) {
    const fromHub = readJson(resolve(gdata, "c", `${from}.json`), null);
    const toHub = readJson(resolve(gdata, "c", `${to}.json`), null);
    if (!toHub) continue;
    const a = fromHub?.attention || 0;
    toHub.attention = (toHub.attention || 0) + a;
    if (fromHub?.top_items?.length) {
      toHub.top_items = dedupBy([...(toHub.top_items || []), ...fromHub.top_items], (it) => it.url, 8);
    }
    if (fromHub?.neighbors?.length) {
      toHub.neighbors = dedupBy(
        [...(toHub.neighbors || []), ...fromHub.neighbors].sort((x, y) => (y.score || 0) - (x.score || 0)),
        (n) => n.id,
        8,
      );
    }
    toHub.folded_from = [...new Set([...(toHub.folded_from || []), from])];
    writeJson(resolve(gdata, "c", `${to}.json`), toHub);
    writeJson(resolve(gdata, "c", `${from}.json`), {
      id: from, redirect: to, label: fromHub?.label || from, attention: a, folded_into: to,
    });
  }

  // 2) Rebuild the index: drop the folded duplicates, and set each durable target's
  //    attention to its hub's now-summed value so the list reflects true prominence.
  const concepts = [];
  for (const c of index.concepts || []) {
    if (foldKeys.has(c.id)) continue;
    if (Object.values(foldMap).includes(c.id)) {
      const hub = readJson(resolve(gdata, "c", `${c.id}.json`), {});
      concepts.push({ ...c, attention: hub.attention || c.attention || 0 });
    } else {
      concepts.push(c);
    }
  }
  writeJson(resolve(gdata, "index.json"), { ...index, count: concepts.length, concepts });

  // 3) De-fragment the trend boards: relabel each folded entity to its durable slug,
  //    merge rows that collapse together (sum attention, delta, and sparkline), and
  //    re-sort by the heat metric so the ranking stays honest.
  let boardsTouched = 0;
  for (const name of existsSync(adata) ? readdirSync(adata) : []) {
    if (!name.endsWith(".json")) continue;
    const p = resolve(adata, name);
    const board = readJson(p, null);
    if (!board?.entities?.length) continue;
    let changed = false;
    const byId = new Map();
    for (const e of board.entities) {
      const to = foldMap[e.id];
      const id = to || e.id;
      const label = to ? titleBySlug.get(to) || e.label : e.label;
      if (to) changed = true;
      if (byId.has(id)) {
        const m = byId.get(id);
        m.attention = (m.attention || 0) + (e.attention || 0);
        m.delta = (m.delta || 0) + (e.delta || 0);
        const len = Math.max(m.sparkline?.length || 0, e.sparkline?.length || 0);
        m.sparkline = Array.from({ length: len }, (_, i) => (m.sparkline?.[i] || 0) + (e.sparkline?.[i] || 0));
        changed = true;
      } else {
        byId.set(id, { ...e, id, label });
      }
    }
    if (changed) {
      const entities = [...byId.values()].sort((a, b) => (b.delta || 0) - (a.delta || 0));
      writeJson(p, { ...board, entities });
      boardsTouched += 1;
    }
  }

  console.log(`fold_corpus: folded ${foldKeys.size} duplicate concepts onto durable hubs, de-fragmented ${boardsTouched} boards.`);
  console.log("fold_corpus: top folds (attention, from -> to):");
  for (const r of report.slice(0, 30)) console.log(`  ${String(r.attention).padStart(4)}  ${r.from}  ->  ${r.to}`);
  return { folded: foldKeys.size, foldMap, report };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) foldCorpus();
