/*
  Offline board regeneration.

  Replays the committed store (worker/.cache/items.json) through the SAME
  corpus-construction run.mjs uses for the attention boards, but with NO network:
  no Pinecone, no Voyage, no model calls. Its one job is to add the new `trail`
  trajectory to every board entity while leaving the existing
  ratio/momentum/quadrant/attention/sparkline/outlier untouched.

  Corpus reconstruction, mirroring run.mjs step 2a and 2b:
    1. collapseStore  (one entry per source item; drop re-edited duplicates)
    2. pruneByRetention (rolling-quarter contract, on the effective timestamp)
    3. remap concepts onto the canonical taxonomy.

  Step 3 matters: run.mjs feeds buildSeries the CANONICAL concepts
  (it.concepts -> remap(it.concepts)), where near-duplicate surface forms are
  merged onto one concept. The merge needs Voyage embeddings, which are offline-
  unavailable, but the resolved mapping is already committed in
  public/data/glossary/_concepts.json ({ id, label, aliases } per concept). We
  reconstruct concepts.mjs's `remap` from that file deterministically: every
  alias (and the canonical label itself) maps to the canonical label, deduped per
  item. Skipping this would feed RAW labels to buildSeries, splitting merged
  concepts apart and shifting attention, ratios, and the top-16 membership, so the
  regenerated boards would differ from the committed ones in more than `trail`.

  Determinism: todayMs is the maximum effective timestamp across the store, so the
  day-windows align to the newest data with no Date.now drift. The `generated`
  stamp is read back from an existing committed attention file so it is preserved
  exactly (this script does not re-date the artifacts).

  Run: node worker/pipeline/recompute_boards.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collapseStore } from "./store.mjs";
import { pruneByRetention } from "./retention.mjs";
import { computeBoards } from "./boards.mjs";
import { HORIZONS, KINDS, RETENTION_DAYS } from "../../src/data/registry.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(HERE, "../../public/data");
const STORE = resolve(HERE, "../.cache/items.json");
const CONCEPTS = resolve(DATA, "glossary/_concepts.json");
const KIND_KEYS = KINDS.map((k) => k.key);

function writeJson(rel, obj) {
  const p = resolve(DATA, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

// Rebuild concepts.mjs's remap from the committed canonical taxonomy: a raw label
// maps to its canonical label (itself if it is canonical, else its alias owner),
// deduped per item. Labels not in the taxonomy are dropped, exactly as run.mjs's
// remap drops surface forms with no canonical entry (the junk-filtered ones).
function remapFromConcepts(concepts) {
  const labelToCanon = new Map();
  for (const c of concepts) {
    labelToCanon.set(c.label, c.label);
    for (const a of c.aliases || []) labelToCanon.set(a, c.label);
  }
  return (raw = []) => {
    const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
    const out = new Set();
    for (const c of list) {
      const canon = labelToCanon.get(String(c || "").trim());
      if (canon) out.add(canon);
    }
    return [...out];
  };
}

function main() {
  const store = JSON.parse(readFileSync(STORE, "utf8"));
  const deduped = collapseStore(store, new Set());

  // todayMs: the newest effective timestamp in the store (parsed published_at,
  // falling back to ingested_at), so day-windows are anchored to the data,
  // reproducibly, with no Date.now drift.
  let todayMs = 0;
  for (const it of Object.values(deduped)) {
    const tPub = new Date(it.published_at).getTime();
    const t = Number.isFinite(tPub) ? tPub : it.ingested_at;
    if (Number.isFinite(t) && t > todayMs) todayMs = t;
  }
  if (!todayMs) todayMs = Date.now();

  pruneByRetention(deduped, { nowMs: todayMs, retentionDays: RETENTION_DAYS });

  const { concepts } = JSON.parse(readFileSync(CONCEPTS, "utf8"));
  const remap = remapFromConcepts(concepts);
  const working = Object.values(deduped).map((it) => ({ ...it, concepts: remap(it.concepts) }));

  // Preserve the existing `generated` stamp from a current committed board.
  const sampleRel = `attention/${KIND_KEYS[0]}_${HORIZONS[0].key}.json`;
  const generated = JSON.parse(readFileSync(resolve(DATA, sampleRel), "utf8")).generated;

  const boards = computeBoards(working, { todayMs, retentionDays: RETENTION_DAYS, horizons: HORIZONS, kinds: KINDS });

  let written = 0;
  for (const kind of KIND_KEYS) {
    for (const h of HORIZONS) {
      writeJson(`attention/${kind}_${h.key}.json`, {
        kind, horizon: h.key, generated, synthetic: false, entities: boards[`${kind}_${h.key}`],
      });
      written += 1;
    }
  }
  console.log(
    `recompute_boards: ${working.length} items, todayMs=${new Date(todayMs).toISOString()}, generated=${generated}, wrote ${written} board files with trails.`
  );
}

main();
