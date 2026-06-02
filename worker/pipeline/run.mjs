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
import { fetchYouTube } from "../sources/youtube.mjs";
import { classifyItem } from "./classify.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert } from "../lib/pinecone.mjs";
import { hash16, itemId, slugify } from "../lib/hash.mjs";
import { buildSeries, windowSum, decayedLevel } from "./attention.mjs";
import { rotationForEntities } from "./rotation.mjs";
import { pca2d } from "./precompute.mjs";
import { HORIZONS, KINDS, RETENTION_DAYS } from "../../src/data/registry.js";

requireKeys();
const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const TODAY = Date.now();
const GENERATED = new Date().toISOString().slice(0, 10);
const MAX = Number(process.argv[2]) || 60;
const KIND_KEYS = KINDS.map((k) => k.key);

function writeJson(rel, obj) {
  const p = resolve(DATA, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

async function classifyAll(items) {
  const out = [];
  const BATCH = 5;
  for (let i = 0; i < items.length; i += BATCH) {
    const res = await Promise.all(
      items.slice(i, i + BATCH).map(async (it) => {
        try {
          return { ...it, ...(await classifyItem(it)) };
        } catch (e) {
          console.error(`  classify fail (${it.title}): ${e.message}`);
          return null;
        }
      })
    );
    out.push(...res.filter(Boolean));
    console.log(`  classified ${Math.min(i + BATCH, items.length)}/${items.length}`);
  }
  return out;
}

async function main() {
  console.log(`1. fetch youtube (max ${MAX}, ${RETENTION_DAYS}d)...`);
  let items = await fetchYouTube({ maxAgeDays: RETENTION_DAYS, perChannel: 15 });
  const seen = new Set();
  items = items.filter((it) => (seen.has(it.source_id) ? false : seen.add(it.source_id))).slice(0, MAX);
  console.log(`   ${items.length} unique items`);

  console.log("2. classify with Claude...");
  const classified = await classifyAll(items);
  if (!classified.length) throw new Error("nothing classified");

  console.log("3. embed + upsert to Pinecone...");
  const vecs = await embed(classified.map((c) => `${c.title}\n\n${c.summary}`), "document");
  const host = await ensureIndex();
  await upsert(
    host,
    classified.map((c, i) => ({
      id: itemId(c.kind, c.source, c.source_id, hash16(c.summary_text || c.title)),
      values: vecs[i],
      metadata: {
        kind: c.kind, source: c.source, title: c.title, url: c.url,
        author_or_channel: c.author_or_channel || "", published_at: c.published_at || "",
        concepts: c.concepts || [], entities: c.entities || [],
        source_authority_weight: c.source_authority_weight ?? 0.8, summary: c.summary || "",
      },
    }))
  );
  console.log(`   upserted ${classified.length}`);

  console.log("4. attention series + rotation per kind and horizon...");
  const { byKind, labels, primaryKind } = buildSeries(classified, { days: RETENTION_DAYS, todayMs: TODAY });
  // Rotation runs on the smooth decayed level; the displayed attention stays the
  // raw weighted mentions in the window.
  const levelByKind = {};
  for (const kind of KIND_KEYS) {
    levelByKind[kind] = Object.fromEntries(Object.entries(byKind[kind] || {}).map(([id, s]) => [id, decayedLevel(s)]));
  }
  const conceptTotals = {};
  for (const kind of KIND_KEYS) {
    const series = byKind[kind] || {};
    for (const h of HORIZONS) {
      const rows = rotationForEntities(levelByKind[kind], h.windows)
        .map((r) => ({
          id: r.id, label: labels[r.id] || r.id,
          attention: Math.round(windowSum(series[r.id] || [], h.days)),
          rs: r.rs, ratio: r.ratio, momentum: r.momentum, quadrant: r.quadrant,
          sparkline: r.sparkline, outlier: r.outlier,
        }))
        .filter((e) => e.attention > 0)
        .sort((a, b) => b.attention - a.attention)
        .slice(0, 16);
      writeJson(`attention/${kind}_${h.key}.json`, { kind, horizon: h.key, generated: GENERATED, synthetic: false, entities: rows });
    }
    for (const [id, s] of Object.entries(series)) conceptTotals[id] = (conceptTotals[id] || 0) + s.reduce((a, b) => a + b, 0);
  }

  console.log("5. constellation (PCA over concept embeddings)...");
  const conceptIds = Object.keys(conceptTotals);
  let points = [];
  if (conceptIds.length) {
    const cvecs = await embed(conceptIds.map((id) => labels[id] || id), "document");
    const xy = pca2d(cvecs);
    points = conceptIds.map((id, i) => ({
      id, kind: primaryKind[id] || "technique", label: labels[id] || id,
      attention: Math.round(conceptTotals[id]), x: xy[i]?.x ?? 0, y: xy[i]?.y ?? 0,
    }));
  }
  writeJson("constellation.json", { method: "pca-power-iteration", dim: 1024, sample_count: points.length, generated: GENERATED, synthetic: false, points });

  console.log("6. digests per horizon...");
  for (const h of HORIZONS) {
    const cutoff = TODAY - h.days * 86400000;
    const newItems = classified
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

  console.log("DONE. Real artifacts written to public/data.");
}

main().catch((e) => {
  console.error("RUN FAILED:", e.message);
  process.exit(1);
});
