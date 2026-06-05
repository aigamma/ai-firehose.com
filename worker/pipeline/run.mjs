/*
  Full ingestion pipeline (v1: YouTube primary).
  fetch -> classify -> embed + upsert -> attention series -> rotation per kind and
  horizon -> digests -> write real artifacts into public/data (replacing the
  synthetic seed).

  Run: node --env-file=worker/.env.local worker/pipeline/run.mjs [maxItems]
*/
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requireKeys } from "../lib/env.mjs";
import { fetchAll } from "../sources/index.mjs";
import { classifyItem } from "./classify.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert, updateMetadata, deleteByIds } from "../lib/pinecone.mjs";
import { hash16, itemId, slugify } from "../lib/hash.mjs";
import { buildSeries, windowSum, decayedLevel } from "./attention.mjs";
import { collapseStore } from "./store.mjs";
import { pruneByRetention } from "./retention.mjs";
import { rotationForEntities } from "./rotation.mjs";
import { computeBoards } from "./boards.mjs";
import { canonicalizeConcepts } from "./concepts.mjs";
import { computeNeighbors, computeClusters, computeSpectrums, computeInfluence } from "./network.mjs";
import { defineConcepts } from "./define.mjs";
import { buildBriefingState, generateBriefing } from "./briefing.mjs";
import { buildCreators } from "../../scripts/build_creators.mjs";
import { buildGlossary } from "../../scripts/build_glossary.mjs";
import { embedGlossary } from "./embed_glossary.mjs";
import { slimGlossaryConcept, slimSpectrumAxis, axisVectors } from "./artifacts.mjs";
import { AXES_ANCHORS } from "./prompts/axes.mjs";
import { loadCache, saveCache } from "../lib/cache.mjs";
import { loadVectorManifest, saveVectorManifest, planVectorSync, markVectorSynced, removeVectorIds } from "./vector_manifest.mjs";
import { HORIZONS, KINDS, RETENTION_DAYS, SITE, NAV, DEFAULT_HORIZON, TAXONOMY } from "../../src/data/registry.js";

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

function corpusVectorRecord(c) {
  const text = `${c.title || ""}\n\n${c.summary || c.summary_text || ""}`.trim();
  const contentHash = hash16(text);
  return {
    id: c.id,
    text,
    metadata: {
      kind: c.kind,
      source: c.source,
      title: c.title,
      url: c.url,
      author_or_channel: c.author_or_channel || "",
      published_at: c.published_at || "",
      concepts: c.concepts || [],
      entities: c.entities || [],
      source_authority_weight: c.source_authority_weight ?? 0.8,
      summary: c.summary || "",
      text: text.slice(0, 2000),
      content_hash: contentHash,
    },
  };
}

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
  console.log("2a. merge into store + collapse re-edited duplicates + prune by retention...");
  const store = loadCache("items");
  const classifiedIds = new Set();
  for (const it of classified) {
    // Stamp first-ingest time once, so an item with a missing or unparseable
    // published_at still has an effective timestamp the retention prune can age
    // out (one quarter after it first entered the store).
    if (store[it.id]?.ingested_at && it.ingested_at == null) it.ingested_at = store[it.id].ingested_at;
    if (it.ingested_at == null) it.ingested_at = TODAY;
    store[it.id] = it;
    classifiedIds.add(it.id);
  }
  // One entry per source item: a re-titled or edited source gets a new content
  // hash (new id) and must replace, not accumulate beside, its prior version.
  const deduped = collapseStore(store, classifiedIds);
  const collapsed = Object.keys(store).length - Object.keys(deduped).length;
  // Effective timestamp: parsed published_at, falling back to ingested_at. An
  // undateable item thus expires one quarter after first ingest rather than living
  // forever, honoring the rolling-quarter contract. (Pure core in retention.mjs.)
  pruneByRetention(deduped, { nowMs: TODAY, retentionDays: RETENTION_DAYS });
  const corpus = Object.values(deduped);
  saveCache("items", deduped);
  console.log(`   store holds ${corpus.length} items within ${RETENTION_DAYS}d (this run added/updated ${classified.length}${collapsed ? `, collapsed ${collapsed} duplicate` : ""})`);

  console.log("2b. concept resolution (fuzzy-merge near-duplicate tags)...");
  // Thresholds come from the registry (the single source of truth): bind at or
  // above mergeThreshold; in the band down to reviewFloor bind only with a lexical
  // signal; below reviewFloor, create a new concept.
  const { canon, remap } = await canonicalizeConcepts(corpus, { high: TAXONOMY.mergeThreshold, mid: TAXONOMY.reviewFloor });
  const working = corpus.map((it) => ({ ...it, concepts: remap(it.concepts) }));
  writeJson("glossary/_concepts.json", {
    generated: GENERATED,
    count: canon.length,
    concepts: canon
      .map((c) => ({ id: c.id, label: c.label, aliases: c.aliases }))
      .sort((a, b) => b.aliases.length - a.aliases.length || a.label.localeCompare(b.label)),
  });
  console.log(`   ${canon.length} canonical concepts (merged from raw labels)`);

  console.log("3. manifest-gated embed/upsert for retained corpus...");
  const host = await ensureIndex();
  let vectorManifest = loadVectorManifest();
  const corpusRecords = working.map(corpusVectorRecord);
  const corpusPlan = planVectorSync(vectorManifest, corpusRecords, "corpus");
  if (corpusPlan.toEmbed.length) {
    const vecs = await embed(corpusPlan.toEmbed.map((r) => r.text), "document");
    // One vector per input, none undefined: an embed batch that returns a short or
    // hole-punched array would otherwise upsert `values: undefined`, which Pinecone
    // rejects mid-run. Fail loudly here instead. (Voyage already reorders by input
    // index in orderEmbeddings; this guards length and completeness.)
    if (vecs.length !== corpusPlan.toEmbed.length || vecs.some((v) => v == null)) {
      throw new Error(`embed returned ${vecs.length} vectors for ${corpusPlan.toEmbed.length} inputs (or a null vector); aborting upsert`);
    }
    await upsert(
      host,
      corpusPlan.toEmbed.map((r, i) => ({
        id: r.id,
        values: vecs[i],
        metadata: r.metadata,
      }))
    );
    vectorManifest = markVectorSynced(vectorManifest, corpusPlan.toEmbed, "corpus");
  }
  if (corpusPlan.toUpdate.length) {
    await updateMetadata(host, corpusPlan.toUpdate.map((r) => ({ id: r.id, metadata: r.metadata })));
    vectorManifest = markVectorSynced(vectorManifest, corpusPlan.toUpdate, "corpus");
  }
  if (corpusPlan.staleIds.length) {
    await deleteByIds(host, corpusPlan.staleIds);
    vectorManifest = removeVectorIds(vectorManifest, corpusPlan.staleIds);
  }
  saveVectorManifest(vectorManifest);
  console.log(
    `   corpus vectors: ${corpusPlan.toEmbed.length} embedded, ${corpusPlan.toUpdate.length} metadata-only, ${corpusPlan.unchanged} unchanged, ${corpusPlan.staleIds.length} deleted (corpus ${working.length})`
  );

  console.log("4. attention series + rotation per kind and horizon...");
  const { byKind, labels, primaryKind } = buildSeries(working, { days: RETENTION_DAYS, todayMs: TODAY });
  // Rotation runs on the smooth decayed level; the displayed attention stays the
  // raw weighted mentions in the window.
  const levelByKind = {};
  for (const kind of KIND_KEYS) {
    levelByKind[kind] = Object.fromEntries(Object.entries(byKind[kind] || {}).map(([id, s]) => [id, decayedLevel(s)]));
  }
  // The served boards (top 16 per kind per horizon, entities carrying a `sparkline`) are
  // built by the shared pure function so run.mjs and the offline recompute cannot
  // drift apart. Same envelope as before.
  const boards = computeBoards(working, { todayMs: TODAY, retentionDays: RETENTION_DAYS, horizons: HORIZONS, kinds: KINDS });
  for (const kind of KIND_KEYS) {
    for (const h of HORIZONS) {
      writeJson(`attention/${kind}_${h.key}.json`, {
        kind, horizon: h.key, generated: GENERATED, synthetic: false, entities: boards[`${kind}_${h.key}`],
      });
    }
  }
  // The hub shows a concept's rotation for the default horizon, taken from its
  // primary kind's board, computed over the FULL ranked list (not just the
  // displayed top 16), so a concept ranking below 16 still gets a hub reading.
  const conceptTotals = {};
  const hubRotation = {}; // concept id -> its rotation status for the hub horizon
  const hubWindows = HORIZONS.find((h) => h.key === DEFAULT_HORIZON).windows;
  for (const kind of KIND_KEYS) {
    const series = byKind[kind] || {};
    for (const r of rotationForEntities(levelByKind[kind], hubWindows)) {
      if (primaryKind[r.id] !== kind) continue;
      if (Math.round(windowSum(series[r.id] || [], HORIZONS.find((h) => h.key === DEFAULT_HORIZON).days)) <= 0) continue;
      hubRotation[r.id] = { horizon: DEFAULT_HORIZON, quadrant: r.quadrant, ratio: r.ratio, momentum: r.momentum, sparkline: r.sparkline };
    }
    for (const [id, s] of Object.entries(series)) conceptTotals[id] = (conceptTotals[id] || 0) + s.reduce((a, b) => a + b, 0);
  }

  console.log("5. network: neighbors, clusters, spectrums, influence...");
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
  // Merge the DURABLE authored knowledge layer (content/glossary) on top of the
  // corpus glossary, so a worker run never drops it. Authored entries are marked
  // durable and persist regardless of retention; the corpus supplies attention,
  // rotation, neighbors, and items where a slug appears in both. See docs/GLOSSARY.md.
  buildGlossary();
  // Make RAG aware of the durable glossary: embed the authored entries into the same
  // Pinecone space as the corpus, so semantic search returns the knowledge layer too.
  // Best-effort; a Voyage hiccup must not sink the run.
  try {
    await embedGlossary();
  } catch (e) {
    console.log(`   glossary embed skipped: ${e.message}`);
  }

  console.log("5d. write sitemap...");
  // Pinecone stale-id deletion is manifest-driven in step 3 and in
  // embed_glossary.mjs. The routine worker no longer lists every vector id, because
  // serverless read-unit limits can make a full `/vectors/list` unavailable.
  // Emit every published concept hub (one /technique/<id> per glossary/c/<id>.json),
  // not a truncated slice, so the sitemap covers the whole live glossary. A concept
  // marked dormant (no items inside the retention window) is dropped if the flag exists.
  const hubRoutes = glossary.filter((c) => !c.dormant).map((c) => `/technique/${c.id}`);
  const routes = ["/", ...NAV.map((n) => n.route), "/about", ...hubRoutes];
  const urls = [...new Set(routes)].map((r) => `  <url><loc>https://${SITE.domain}${r}</loc></url>`).join("\n");
  writeFileSync(resolve(DATA, "../sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  console.log("6. digests per horizon...");
  for (const h of HORIZONS) {
    const cutoff = TODAY - h.days * 86400000;
    // Dedup by url (fallback id) before slicing: a collapsed re-edit or a cross-posted
    // story can carry one url under two internal ids and would otherwise show twice.
    const newItemsByUrl = new Map();
    for (const c of working
      .filter((c) => { const t = new Date(c.published_at).getTime(); return Number.isFinite(t) && t >= cutoff; })
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))) {
      const k = c.url || c.id;
      if (!newItemsByUrl.has(k)) newItemsByUrl.set(k, c);
    }
    const newItems = [...newItemsByUrl.values()]
      .slice(0, 12)
      // Carry `id` (a stable React key and the concept-hub citation target) and the
      // classifier `summary` (already on the row, set at upsert) so the Home "What
      // Is New" feed can render a cited ItemCard, not just a title. See the Citation
      // Contract in docs/RAG.md. Verbatim, no extra model cost.
      .map((c) => ({ id: c.id, kind: c.kind, title: c.title, source: c.source, author_or_channel: c.author_or_channel || "", published_at: c.published_at, url: c.url, summary: c.summary || "", concepts: (c.concepts || []).map(slugify) }));
    const all = [];
    for (const kind of KIND_KEYS) {
      const series = byKind[kind] || {};
      all.push(
        ...rotationForEntities(levelByKind[kind], h.windows)
          .map((r) => ({ ...r, kind, label: labels[r.id] || r.id, attention: Math.round(windowSum(series[r.id] || [], h.days)) }))
          .filter((e) => e.attention > 0)
      );
    }
    // A concept can surface on more than one kind's board; dedup by concept id so the
    // same entry does not appear twice in movers or outliers.
    const uniqById = (rows) => {
      const seenIds = new Set();
      return rows.filter((e) => (seenIds.has(e.id) ? false : seenIds.add(e.id)));
    };
    const movers = uniqById([...all].sort((a, b) => Math.abs(b.momentum - 100) - Math.abs(a.momentum - 100))).slice(0, 8);
    const outliers = uniqById(all.filter((e) => e.outlier?.breakout || e.outlier?.new_entrant)).slice(0, 8);
    writeJson(`digests/${h.key}.json`, { horizon: h.key, generated: GENERATED, synthetic: false, new_items: newItems, movers, outliers });

    // Agentic daily briefing: a cited, sanitized prose summary of this window, built
    // from the window's own richer movers (the full board, new entrants excluded),
    // breakouts, and new items. Cached on a hash of that state, so an unchanged
    // window costs nothing. Wrapped so a model hiccup never sinks the run.
    try {
      const briefMovers = uniqById(
        [...all].filter((e) => !e.outlier?.new_entrant).sort((a, b) => Math.abs(b.momentum - 100) - Math.abs(a.momentum - 100))
      ).slice(0, 8);
      const state = buildBriefingState({ horizon: h.key, horizonLabel: h.label.toLowerCase(), movers: briefMovers, outliers, newItems });
      const brief = await generateBriefing(state);
      if (brief) writeJson(`digests/briefing_${h.key}.json`, { horizon: h.key, generated: GENERATED, ...brief });
    } catch (e) {
      console.error(`briefing ${h.key}: ${e.message}`);
    }
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
  const sortedFeed = [...working]
    .filter((it) => it.published_at)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  // Dedup by url, keeping the newest: items are already sorted newest-first, so the
  // first time a url is seen is its freshest version. Prevents a collapsed re-edit or
  // a cross-posted story from appearing twice in the feed.
  const feedByUrl = new Map();
  for (const it of sortedFeed) if (it.url && !feedByUrl.has(it.url)) feedByUrl.set(it.url, it);
  const feedRows = [...feedByUrl.values()]
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
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xmlEsc(SITE.name)}: What Is New</title>`,
    `    <link>https://${SITE.domain}/</link>`,
    `    <atom:link href="https://${SITE.domain}/feed.xml" rel="self" type="application/rss+xml" />`,
    `    <description>${xmlEsc(SITE.description)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${new Date(TODAY).toUTCString()}</lastBuildDate>`,
    "    <generator>ai-firehose</generator>",
    feedRows,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  writeFileSync(resolve(DATA, "../feed.xml"), rss);

  // Featured creators (the Watch surface). Refreshes public/data/creators.json from
  // the curated registry plus this run's fresh corpus (the RAG join). The same
  // resolver runs at build time as a prebuild step, so the artifact stays current
  // even between worker runs; here the worker keeps the committed fallback fresh.
  console.log("5g. featured creators (Watch surface)...");
  try {
    await buildCreators({ source: "worker" });
  } catch (e) {
    console.error(`creators: ${e.message}`);
  }

  console.log("DONE. Real artifacts written to public/data.");
}

main().catch((e) => {
  console.error("RUN FAILED:", e.message);
  process.exit(1);
});
