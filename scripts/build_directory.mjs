/*
  Creators Directory builder (the IO runner).

  Reads the ingestion registry (sources/youtube_channels.json), the committed corpus
  (worker/.cache/items.json), and the glossary index (for resolvable concept slugs),
  then writes the served roster public/data/directory.json via the pure buildRoster.
  Corpus-only and deterministic, so it is a HARD prebuild and generated-fresh gate
  (unlike build_creators.mjs, which polls live RSS and soft-fails). Reused by the build
  (a prebuild step) and the worker (run.mjs), writing the identical artifact so the two
  cannot drift. Runs without API keys. See docs/SOURCES.md and docs/FEATURE_PLAYBOOK.md.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildRoster, corpusDate } from "./lib/directory.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHANNELS = resolve(HERE, "../sources/youtube_channels.json");
const ITEMS = resolve(HERE, "../worker/.cache/items.json");
const GLOSSARY = resolve(HERE, "../public/data/glossary/index.json");
const OUT = resolve(HERE, "../public/data/directory.json");

const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

export async function buildDirectory({ source = "build" } = {}) {
  const channels = readJson(CHANNELS, { channels: [] }).channels || [];
  const items = Object.values(readJson(ITEMS, {}));
  const index = readJson(GLOSSARY, { concepts: [] });
  const glossarySlugs = new Set((index.concepts || []).map((c) => c.id));
  const durableSlugs = new Set((index.concepts || []).filter((c) => c.durable).map((c) => c.id));

  const roster = buildRoster({ channels, items, glossarySlugs, durableSlugs });
  const out = { generated: corpusDate(items), roster };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
  return { ...out, source };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  buildDirectory()
    .then((o) => {
      const enriched = o.roster.filter((r) => r.videoCount > 0).length;
      console.log(`directory.json: ${o.roster.length} creators, ${enriched} with corpus enrichment`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
