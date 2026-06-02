import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Referential integrity of the served artifacts: every /technique/:id the UI can
// link to (constellation, rotation boards, clusters, spectrums, influence, digests,
// glossary, and hub neighbors) must resolve to a per-concept hub file. Guards
// against an id-space drift, e.g. a digest storing raw slugs instead of canonical
// concept ids, which would render as dead "Unknown concept" links.

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const J = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
const has = (rel) => existsSync(resolve(DATA, rel));

test("every /technique/:id link target across served artifacts has a hub file", () => {
  const hubs = new Set(readdirSync(resolve(DATA, "glossary/c")).map((f) => f.replace(/\.json$/, "")));
  assert.ok(hubs.size > 0, "expected per-concept hub files");

  const dangling = {};
  const check = (name, ids) => {
    const miss = [...new Set(ids)].filter((id) => id && !hubs.has(id));
    if (miss.length) dangling[name] = miss.slice(0, 10);
  };

  check("constellation.points", J("constellation.json").points.map((p) => p.id));
  check("glossary.index", J("glossary/index.json").concepts.map((c) => c.id));
  check("clusters.members", J("clusters.json").clusters.flatMap((c) => (c.members || []).map((m) => m.id)));
  check("spectrums.positions", J("spectrums.json").axes.flatMap((a) => a.positions.map((p) => p.id)));
  check("influence.edges", J("influence.json").edges.flatMap((e) => [e.from, e.to]));

  for (const k of ["technique", "tool", "opinion"]) {
    for (const h of ["day", "week", "month", "quarter"]) {
      const rel = `attention/${k}_${h}.json`;
      if (has(rel)) check(rel, J(rel).entities.map((e) => e.id));
    }
  }
  for (const h of ["day", "week", "month", "quarter"]) {
    const rel = `digests/${h}.json`;
    if (!has(rel)) continue;
    const d = J(rel);
    check(`${rel}:outliers`, (d.outliers || []).map((o) => o.id));
    check(`${rel}:movers`, (d.movers || []).map((o) => o.id));
    check(`${rel}:chips`, (d.new_items || []).flatMap((it) => it.concepts || []));
  }

  const neighbors = [];
  for (const id of hubs) neighbors.push(...(J(`glossary/c/${id}.json`).neighbors || []).map((n) => n.id));
  check("hub.neighbors", neighbors);

  assert.deepEqual(dangling, {}, `dangling /technique links found:\n${JSON.stringify(dangling, null, 2)}`);
});
