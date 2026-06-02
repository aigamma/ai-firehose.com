/*
  Full ingestion pipeline (v1: YouTube primary).
  fetch -> classify -> embed + upsert -> attention series -> rotation per kind and
  horizon -> constellation (PCA over concept embeddings) -> digests -> write real
  artifacts into public/data (replacing the synthetic seed).

  Run: node --env-file=worker/.env.local worker/pipeline/run.mjs [maxItems]
*/
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requireKeys } from "../lib/env.mjs";
import { fetchAll } from "../sources/index.mjs";
import { classifyItem } from "./classify.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert, listIds, deleteByIds } from "../lib/pinecone.mjs";
import { hash16, itemId, slugify } from "../lib/hash.mjs";
import { buildSeries, windowSum, decayedLevel } from "./attention.mjs";
import { rotationForEntities } from "./rotation.mjs";
import { pca2d } from "./precompute.mjs";
import { canonicalizeConcepts } from "./concepts.mjs";
import { computeNeighbors, computeClusters, computeSpectrums, computeInfluence } from "./network.mjs";
import { defineConcepts } from "./define.mjs";
import { slimGlossaryConcept, slimSpectrumAxis, axisVectors } from "./artifacts.mjs";
import { AXES_ANCHORS } from "./prompts/axes.mjs";
import { loadCache, saveCache } from "../lib/cache.mjs";
import { HORIZONS, KINDS, RETENTION_DAYS, SITE, NAV, DEFAULT_HORIZON } from "../../src/data/registry.js";

requireKeys();
const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const TODAY = Date.now();
const GENERATED = new Date().toISOString().slice(0, 10);
const MAX = Number(process.argv[2]) || 300; // backstop only; per-source limits bound volume. Must exceed the sum of source limits so no source is truncated.
const KIND_KEYS = KINDS.map((k) => k.key);

function writeJson(rel, obj) {
  const p = resolve(DATA, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

const xmlEsc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

async function classifyAll(items) {
  const cache = loadCache("classify");
  const keyOf = (it) => `${it.source}:${it.source_id}:${hash16(it.summary_text || it.title)}`;
  const out = [];
  const todo = [];
  let hits = 0;
  for (const it of items) {
    const cached = cache[keyOf(it)];
    if (cached) {
      out.push({ ...it, ...cached });
      hits += 1;
    } else {
      todo.push(it);
    }
  }
  const BATCH = 5;
  for (let i = 0; i < todo.length; i += BATCH) {
    const res = await Promise.all(
      todo.slice(i, i + BATCH).map(async (it) => {
        try {
          const c = await classifyItem(it);
          cache[keyOf(it)] = c;
          return { ...it, ...c };
        } catch (e) {
          console.error(`  classify fail (${it.title}): ${e.message}`);
          return null;
        }
      })
    );
    out.push(...res.filter(Boolean));
    console.log(`  classified ${Math.min(i + BATCH, todo.length)}/${todo.length} new (${hits} cache hits)`);
  }
  if (todo.length) saveCache("classify", cache);
  else console.log(`  all ${hits} items from cache`);
  return out;
}

async function main() {
  console.log(`1. fetch all sources (max ${MAX}, ${RETENTION_DAYS}d)...`);
  let items = await fetchAll({ maxAgeDays: RETENTION_DAYS });
  const seen = new Set();
  items = items
    .filter((it) => {
      const k = `${it.source}:${it.source_id}`;
      return seen.has(k) ? false : seen.add(k);
    })
    .slice(0, MAX);
  console.log(`   ${items.length} unique items`);

  console.log("2. classify with Claude...");
  const classified = await classifyAll(items);
  if (!classified.length) throw new Error("nothing classified");
  for (const it of classified) it.id = itemId(it.kind, it.source, it.source_id, hash16(it.summary_text || it.title));

  // Accumulate into a persistent store so the artifacts reflect the whole
  // retained corpus, not just whichever feeds succeeded this run. Prune by
  // retention (published_at). The store keeps RAW classifier concepts; the
  // canonical mapping is recomputed each run.
  console.log("2a. merge into store + prune by retention...");
  const store = loadCache("items");
  for (const it of classified) store[it.id] = it;
  const cutoffMs = TODAY - RETENTION_DAYS * 86400000;
  for (const [id, it] of Object.entries(store)) {
    const t = new Date(it.published_at).getTime();
    if (Number.isFinite(t) && t < cutoffMs) delete store[id];
  }
  const corpus = Object.values(store);
  saveCache("items", store);
  console.log(`   store holds ${corpus.length} items within ${RETENTION_DAYS}d (this run added/updated ${classified.length})`);

  console.log("2b. concept resolution (fuzzy-merge near-duplicate tags)...");
  const { canon, remap } = await canonicalizeConcepts(corpus);
  const working = corpus.map((it) => ({ ...it, concepts: remap(it.concepts) }));
  writeJson("glossary/_concepts.json", {
    generated: GENERATED,
    count: canon.length,
    concepts: canon
      .map((c) => ({ id: c.id, label: c.label, aliases: c.aliases }))
      .sort((a, b) => b.aliases.length - a.aliases.length || a.label.localeCompare(b.label)),
  });
  console.log(`   ${canon.length} canonical concepts (merged from raw labels)`);

  console.log("3. embed + upsert this run's items to Pinecone...");
  const runIds = new Set(classified.map((c) => c.id));
  const fresh = working.filter((c) => runIds.has(c.id));
  const host = await ensureIndex();
  if (fresh.length) {
    const vecs = await embed(fresh.map((c) => `${c.title}\n\n${c.summary}`), "document");
    await upsert(
      host,
      fresh.map((c, i) => ({
        id: c.id,
        values: vecs[i],
        metadata: {
          kind: c.kind, source: c.source, title: c.title, url: c.url,
          author_or_channel: c.author_or_channel || "", published_at: c.published_at || "",
          concepts: c.concepts || [], entities: c.entities || [],
          source_authority_weight: c.source_authority_weight ?? 0.8, summary: c.summary || "",
        },
      }))
    );
  }
  console.log(`   upserted ${fresh.length} (corpus ${working.length})`);

  console.log("4. attention series + rotation per kind and horizon...");
  const { byKind, labels, primaryKind } = buildSeries(working, { days: RETENTION_DAYS, todayMs: TODAY });
  // Rotation runs on the smooth decayed level; the displayed attention stays the
  // raw weighted mentions in the window.
  const levelByKind = {};
  for (const kind of KIND_KEYS) {
    levelByKind[kind] = Object.fromEntries(Object.entries(byKind[kind] || {}).map(([id, s]) => [id, decayedLevel(s)]));
  }
  const conceptTotals = {};
  const hubRotation = {}; // concept id -> its rotation status for the hub horizon (its primary kind's board)
  for (const kind of KIND_KEYS) {
    const series = byKind[kind] || {};
    for (const h of HORIZONS) {
      const ranked = rotationForEntities(levelByKind[kind], h.windows)
        .map((r) => ({
          id: r.id, label: labels[r.id] || r.id,
          attention: Math.round(windowSum(series[r.id] || [], h.days)),
          rs: r.rs, ratio: r.ratio, momentum: r.momentum, quadrant: r.quadrant,
          sparkline: r.sparkline, outlier: r.outlier,
        }))
        .filter((e) => e.attention > 0)
        .sort((a, b) => b.attention - a.attention);
      // The hub shows a concept's rotation for the default horizon, taken from its
      // primary kind's board (full ranked list, not just the displayed top 16).
      if (h.key === DEFAULT_HORIZON) {
        for (const e of ranked) {
          if (primaryKind[e.id] === kind) {
            hubRotation[e.id] = { horizon: h.key, quadrant: e.quadrant, ratio: e.ratio, momentum: e.momentum, sparkline: e.sparkline };
          }
        }
      }
      writeJson(`attention/${kind}_${h.key}.json`, { kind, horizon: h.key, generated: GENERATED, synthetic: false, entities: ranked.slice(0, 16) });
    }
    for (const [id, s] of Object.entries(series)) conceptTotals[id] = (conceptTotals[id] || 0) + s.reduce((a, b) => a + b, 0);
  }

  console.log("5. constellation (PCA over canonical concept embeddings)...");
  const idToVec = Object.fromEntries(canon.map((c) => [c.id, c.vec]));
  const conceptIds = Object.keys(conceptTotals).filter((id) => idToVec[id]);
  let points = [];
  if (conceptIds.length) {
    const xy = pca2d(conceptIds.map((id) => idToVec[id]));
    points = conceptIds.map((id, i) => ({
      id, kind: primaryKind[id] || "technique", label: labels[id] || id,
      attention: Math.round(conceptTotals[id]), x: xy[i]?.x ?? 0, y: xy[i]?.y ?? 0,
    }));
  }
  writeJson("constellation.json", { method: "pca-power-iteration", dim: 1024, sample_count: points.length, generated: GENERATED, synthetic: false, points });

  console.log("5b. network: neighbors, clusters, spectrums, influence...");
  const canonById = Object.fromEntries(canon.map((c) => [c.id, c]));
  const neighbors = computeNeighbors(canon);
  const clusters = computeClusters(canon, conceptTotals);
  const spectrums = await computeSpectrums(canon, AXES_ANCHORS, embed);
  const influence = computeInfluence(working, canonById);
  writeJson("clusters.json", { generated: GENERATED, clusters });
  // The served spectrums file carries only what the UI renders. Each axis_vector
  // is 1024 dims (~85KB/axis) and is needed only for future server-side live
  // projection, so it is parked in the worker cache, not shipped to the browser.
  // neighbors are denormalized into the per-concept hubs below, so the standalone
  // neighbors.json (fetched by nothing) is no longer published.
  writeJson("spectrums.json", { generated: GENERATED, axes: spectrums.map(slimSpectrumAxis) });
  mkdirSync(resolve(DATA, "../../worker/.cache"), { recursive: true });
  writeFileSync(
    resolve(DATA, "../../worker/.cache/axis_vectors.json"),
    `${JSON.stringify({ generated: GENERATED, axes: axisVectors(spectrums) }, null, 2)}\n`
  );
  writeJson("influence.json", { generated: GENERATED, ...influence });

  console.log("5c. glossary index (per-concept integration hubs)...");
  const conceptToItems = {};
  for (const it of working) {
    for (const id of new Set((it.concepts || []).map(slugify))) (conceptToItems[id] ||= []).push(it);
  }
  const axisPosById = {};
  for (const ax of spectrums) {
    for (const p of ax.positions) (axisPosById[p.id] ||= []).push({ slug: ax.slug, title: ax.title, position: p.position_normalized });
  }
  const glossary = canon
    .map((c) => ({
      id: c.id,
      label: c.label,
      aliases: c.aliases,
      kind: primaryKind[c.id] || "technique",
      attention: Math.round(conceptTotals[c.id] || 0),
      first_seen: (conceptToItems[c.id] || []).map((it) => it.published_at).filter(Boolean).sort()[0] || null,
      rotation: hubRotation[c.id] || null,
      neighbors: (neighbors[c.id] || []).slice(0, 6),
      axis_positions: axisPosById[c.id] || [],
      top_items: (conceptToItems[c.id] || [])
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, 6)
        .map((it) => ({ title: it.title, url: it.url, author_or_channel: it.author_or_channel, published_at: it.published_at, kind: it.kind })),
    }))
    .sort((a, b) => b.attention - a.attention);
  const defs = await defineConcepts(glossary, conceptToItems, { limit: 60 });
  for (const c of glossary) if (defs[c.id]) c.definition = defs[c.id];
  // Split payload: one hub file per concept, fetched on demand by /technique/:slug,
  // plus a light index for the list and search. Previously the full hub set (~1MB)
  // shipped on every glossary view and every hub view.
  for (const c of glossary) writeJson(`glossary/c/${c.id}.json`, c);
  const index = glossary.map(slimGlossaryConcept);
  writeJson("glossary/index.json", { generated: GENERATED, count: index.length, concepts: index });

  console.log("5d. reconcile Pinecone with the retained store + write sitemap...");
  try {
    const liveIds = await listIds(host);
    const keep = new Set(Object.keys(store));
    const stale = liveIds.filter((id) => !keep.has(id));
    await deleteByIds(host, stale);
    console.log(`   pinecone ${liveIds.length} vectors, removed ${stale.length} aged-out`);
  } catch (e) {
    console.log(`   reconcile skipped: ${e.message}`);
  }
  const routes = ["/", ...NAV.map((n) => n.route), "/about", ...glossary.slice(0, 80).map((c) => `/technique/${c.id}`)];
  const urls = [...new Set(routes)].map((r) => `  <url><loc>https://${SITE.domain}${r}</loc></url>`).join("\n");
  writeFileSync(resolve(DATA, "../sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  console.log("6. digests per horizon...");
  for (const h of HORIZONS) {
    const cutoff = TODAY - h.days * 86400000;
    const newItems = working
      .filter((c) => { const t = new Date(c.published_at).getTime(); return Number.isFinite(t) && t >= cutoff; })
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 12)
      .map((c) => ({ kind: c.kind, title: c.title, source: c.source, author_or_channel: c.author_or_channel || "", published_at: c.published_at, url: c.url, concepts: (c.concepts || []).map(slugify) }));
    const all = [];
    for (const kind of KIND_KEYS) {
      const series = byKind[kind] || {};
      all.push(
        ...rotationForEntities(levelByKind[kind], h.windows)
          .map((r) => ({ ...r, kind, label: labels[r.id] || r.id, attention: Math.round(windowSum(series[r.id] || [], h.days)) }))
          .filter((e) => e.attention > 0)
      );
    }
    const movers = [...all].sort((a, b) => Math.abs(b.momentum - 100) - Math.abs(a.momentum - 100)).slice(0, 8);
    const outliers = all.filter((e) => e.outlier?.breakout || e.outlier?.new_entrant).slice(0, 8);
    writeJson(`digests/${h.key}.json`, { horizon: h.key, generated: GENERATED, synthetic: false, new_items: newItems, movers, outliers });
  }

  console.log("5f. corpus stats...");
  const srcCounts = {};
  const kindCounts = {};
  for (const it of working) {
    srcCounts[it.source] = (srcCounts[it.source] || 0) + 1;
    kindCounts[it.kind] = (kindCounts[it.kind] || 0) + 1;
  }
  writeJson("stats.json", {
    generated: GENERATED,
    retention_days: RETENTION_DAYS,
    total_items: working.length,
    concepts: canon.length,
    by_source: srcCounts,
    by_kind: kindCounts,
  });

  console.log("5e. RSS feed (subscribable firehose)...");
  const feedRows = [...working]
    .filter((it) => it.published_at)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 50)
    .map((it) =>
      [
        "    <item>",
        `      <title>${xmlEsc(it.title)}</title>`,
        `      <link>${xmlEsc(it.url)}</link>`,
        `      <guid isPermaLink="false">${xmlEsc(it.id)}</guid>`,
        `      <pubDate>${new Date(it.published_at).toUTCString()}</pubDate>`,
        `      <category>${xmlEsc(it.kind || "")}</category>`,
        `      <description>${xmlEsc(`${it.author_or_channel || it.source}: ${(it.summary || it.title || "").slice(0, 500)}`)}</description>`,
        "    </item>",
      ].join("\n")
    )
    .join("\n");
  const rss = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${xmlEsc(SITE.name)}: What Is New</title>`,
    `    <link>https://${SITE.domain}/</link>`,
    `    <description>${xmlEsc(SITE.description)}</description>`,
    `    <lastBuildDate>${new Date(TODAY).toUTCString()}</lastBuildDate>`,
    feedRows,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  writeFileSync(resolve(DATA, "../feed.xml"), rss);

  console.log("DONE. Real artifacts written to public/data.");
}

main().catch((e) => {
  console.error("RUN FAILED:", e.message);
  process.exit(1);
});
