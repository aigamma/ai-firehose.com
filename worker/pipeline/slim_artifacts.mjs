/*
  One-time migration: reshape the committed artifacts to the split-payload form the
  pipeline now emits, so the win is live without re-running ingestion (which needs
  API keys + network). Pure local file transforms. Idempotent: detects already-slim
  input and skips, so it is safe to re-run.

    glossary/index.json (fat, hub-per-concept)
      -> glossary/c/<id>.json  (full hub: definition, neighbors, axes, items)
      +  glossary/index.json   (slim: id, label, kind, attention, aliases, def_snippet)
    spectrums.json
      -> drop axis_vector (park in worker/.cache) and unused raw position from the
         served file; keep only what the UI renders
    neighbors.json
      -> remove (denormalized into the hubs; fetched by nothing)

  Run: node worker/pipeline/slim_artifacts.mjs
*/
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const read = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
const write = (rel, obj) => {
  const p = resolve(DATA, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
};
const SNIPPET = 180;

// 1. Glossary: split fat index into per-concept hubs + a slim index.
const gi = read("glossary/index.json");
const concepts = gi.concepts || [];
const isFat = concepts[0] && (concepts[0].neighbors !== undefined || concepts[0].top_items !== undefined);
if (isFat) {
  for (const c of concepts) write(`glossary/c/${c.id}.json`, c);
  const index = concepts.map((c) => ({
    id: c.id,
    label: c.label,
    kind: c.kind,
    attention: c.attention,
    aliases: c.aliases || [],
    def_snippet: c.definition
      ? (c.definition.length > SNIPPET ? `${c.definition.slice(0, SNIPPET).trimEnd()}…` : c.definition)
      : "",
  }));
  write("glossary/index.json", { generated: gi.generated, count: index.length, concepts: index });
  console.log(`glossary: split ${concepts.length} hubs + slimmed index`);
} else {
  console.log("glossary: already slim, skipped");
}

// 2. Spectrums: keep only what the UI renders; cache the axis vectors.
const sp = read("spectrums.json");
const hasVectors = (sp.axes || []).some((a) => a.axis_vector !== undefined);
const hasRawPos = (sp.axes || []).some((a) => (a.positions || []).some((p) => p.position !== undefined));
if (hasVectors || hasRawPos) {
  if (hasVectors) {
    const cacheDir = resolve(DATA, "../../worker/.cache");
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(
      resolve(cacheDir, "axis_vectors.json"),
      `${JSON.stringify({ generated: sp.generated, axes: sp.axes.map((a) => ({ slug: a.slug, axis_vector: a.axis_vector })) }, null, 2)}\n`
    );
  }
  const axes = sp.axes.map(({ axis_vector, positions, ...ax }) => ({
    ...ax,
    positions: (positions || []).map(({ position, ...p }) => p),
  }));
  write("spectrums.json", { generated: sp.generated, axes });
  console.log(`spectrums: slimmed ${sp.axes.length} axes (vectors:${hasVectors}, rawpos:${hasRawPos})`);
} else {
  console.log("spectrums: already slim, skipped");
}

// 3. Neighbors: drop the unused served artifact.
if (existsSync(resolve(DATA, "neighbors.json"))) {
  rmSync(resolve(DATA, "neighbors.json"));
  console.log("neighbors.json: removed");
} else {
  console.log("neighbors.json: absent, skipped");
}
