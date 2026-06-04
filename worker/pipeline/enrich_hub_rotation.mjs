/*
  One-time enrichment: add a `rotation` field to the committed per-concept hubs so
  the Momentum card renders before the next live ingest. Reads the committed
  attention boards for the default horizon and joins each concept's status onto its
  hub by primary kind (the hub's own `kind`). Pure local; idempotent.

  Limitation: the committed boards are the displayed top 16 per kind, so only those
  concepts gain rotation here. A full pipeline run (run.mjs) sets it for every
  concept that has attention in the window. Run: node worker/pipeline/enrich_hub_rotation.mjs
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_HORIZON } from "../../src/data/registry.js";

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const read = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
const write = (rel, obj) => writeFileSync(resolve(DATA, rel), `${JSON.stringify(obj, null, 2)}\n`);
const has = (rel) => existsSync(resolve(DATA, rel));

// id (scoped by board kind) -> rotation status for the hub horizon.
const rot = {};
for (const kind of ["technique", "tool", "opinion"]) {
  const rel = `attention/${kind}_${DEFAULT_HORIZON}.json`;
  if (!has(rel)) continue;
  for (const e of read(rel).entities) {
    // The served boards no longer carry rotation (ratio, momentum, quadrant): it is
    // written to the hubs natively by run.mjs, so this one-time backfill is
    // superseded and is a no-op against slimmed boards. Guard so it can never write
    // a hub a rotation object with undefined fields.
    if (e.quadrant == null) continue;
    rot[`${kind}::${e.id}`] = { horizon: DEFAULT_HORIZON, quadrant: e.quadrant, ratio: e.ratio, momentum: e.momentum, sparkline: e.sparkline };
  }
}

let enriched = 0;
for (const f of readdirSync(resolve(DATA, "glossary/c"))) {
  const h = read(`glossary/c/${f}`);
  const r = rot[`${h.kind}::${h.id}`] || null;
  const next = {
    id: h.id, label: h.label, aliases: h.aliases, kind: h.kind, attention: h.attention,
    rotation: r, neighbors: h.neighbors, axis_positions: h.axis_positions, top_items: h.top_items,
  };
  if (h.definition !== undefined) next.definition = h.definition;
  if (h.first_seen !== undefined) next.first_seen = h.first_seen;
  write(`glossary/c/${f}`, next);
  if (r) enriched++;
}
console.log(`hub rotation: ${enriched} hubs enriched from the ${DEFAULT_HORIZON} boards`);
