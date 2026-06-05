import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defSnippet, slimGlossaryConcept, slimSpectrumAxis, axisVectors, DEF_SNIPPET } from "./artifacts.mjs";

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const read = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));

test("defSnippet truncates long definitions with an ellipsis, passes short ones through", () => {
  assert.equal(defSnippet(""), "");
  assert.equal(defSnippet(null), "");
  assert.equal(defSnippet("short"), "short");
  const out = defSnippet("x".repeat(DEF_SNIPPET + 50));
  assert.ok(out.length <= DEF_SNIPPET + 1, "snippet stays within the cap plus the ellipsis");
  assert.ok(out.endsWith("…"));
});

test("slimGlossaryConcept keeps only the list fields, drops the heavy hub fields", () => {
  const slim = slimGlossaryConcept({
    id: "x", label: "X", kind: "tool", attention: 5, aliases: ["a"],
    definition: "A definition.", neighbors: [{ id: "y" }], axis_positions: [{ slug: "s" }], top_items: [{ title: "t" }],
  });
  assert.deepEqual(Object.keys(slim).sort(), ["aliases", "attention", "def_snippet", "id", "kind", "label"]);
  assert.equal(slim.def_snippet, "A definition.");
  assert.equal(slim.neighbors, undefined);
  assert.equal(slim.top_items, undefined);
  assert.equal(slim.axis_positions, undefined);
});

test("slimSpectrumAxis drops axis_vector and raw position, keeps position_normalized", () => {
  const slim = slimSpectrumAxis({
    slug: "s", title: "T", pole_a: "A", pole_b: "B", axis_vector: [0.1, 0.2],
    positions: [{ id: "x", label: "X", position: 0.5, position_normalized: 0.9 }],
  });
  assert.equal(slim.axis_vector, undefined);
  assert.deepEqual(Object.keys(slim).sort(), ["pole_a", "pole_b", "positions", "slug", "title"]);
  assert.deepEqual(slim.positions[0], { id: "x", label: "X", position_normalized: 0.9 });
});

test("axisVectors extracts slug and vector pairs", () => {
  assert.deepEqual(
    axisVectors([{ slug: "s", title: "T", axis_vector: [1, 2], positions: [] }]),
    [{ slug: "s", axis_vector: [1, 2] }]
  );
});

// Tripwire on the committed served payloads: catches a regression that re-fattens
// the glossary index or re-embeds axis vectors (the 1MB+ bloat this guards against).
test("committed glossary index is slim and a hub carries the full payload", () => {
  const idx = read("glossary/index.json");
  assert.ok(idx.concepts.length > 0);
  for (const c of idx.concepts) {
    assert.equal(c.neighbors, undefined, `${c.id} index entry must not carry neighbors`);
    assert.equal(c.top_items, undefined, `${c.id} index entry must not carry top_items`);
    assert.equal(c.axis_positions, undefined, `${c.id} index entry must not carry axis_positions`);
    assert.equal(c.definition, undefined, `${c.id} index entry must not carry the full definition`);
  }
  const sample = idx.concepts[0];
  const hub = read(`glossary/c/${sample.id}.json`);
  assert.equal(hub.id, sample.id);
  assert.ok("neighbors" in hub && "axis_positions" in hub && "top_items" in hub, "hub keeps the full payload");
});

test("hub rotation, where present, is well-formed and is absent from the slim index", () => {
  const quads = new Set(["leading", "improving", "weakening", "lagging"]);
  let withRotation = 0;
  for (const f of readdirSync(resolve(DATA, "glossary/c"))) {
    const h = JSON.parse(readFileSync(resolve(DATA, "glossary/c", f), "utf8"));
    // A folded-duplicate redirect stub (scripts/fold_corpus_concepts.mjs) is a minimal
    // pointer to its durable hub, not a content hub, so it is exempt from the shape contract.
    if (h.redirect) continue;
    assert.ok("rotation" in h, `${h.id} hub must carry a rotation field (object or null)`);
    assert.ok("first_seen" in h, `${h.id} hub must carry a first_seen field`);
    if (h.rotation) {
      withRotation++;
      assert.ok(quads.has(h.rotation.quadrant), `${h.id} rotation.quadrant must be a real quadrant`);
      assert.ok(Array.isArray(h.rotation.sparkline) && h.rotation.sparkline.length > 0, `${h.id} rotation.sparkline`);
      assert.equal(typeof h.rotation.ratio, "number");
      assert.equal(typeof h.rotation.momentum, "number");
      assert.ok(h.rotation.horizon, `${h.id} rotation.horizon`);
    }
  }
  assert.ok(withRotation > 0, "expected some hubs to carry rotation");
  for (const c of read("glossary/index.json").concepts) {
    assert.equal(c.rotation, undefined, `${c.id} slim index entry must not carry rotation`);
  }
});

test("committed spectrums carry no axis_vector or raw position, and neighbors.json is gone", () => {
  const sp = read("spectrums.json");
  for (const ax of sp.axes) {
    assert.equal(ax.axis_vector, undefined, `${ax.slug} must not ship axis_vector`);
    for (const p of ax.positions) {
      assert.equal(p.position, undefined, `${ax.slug} position must not ship raw position`);
      assert.ok(typeof p.position_normalized === "number");
    }
  }
  assert.equal(existsSync(resolve(DATA, "neighbors.json")), false, "neighbors.json must not be served");
});
